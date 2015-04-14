from datetime import datetime

from flask import request
import wbdata


import rpy2.robjects as robjects
from rpy2.robjects import FloatVector
from rpy2.robjects.packages import importr
from modules.rpy2_wrap import functions as rpy2functions
base = importr('base')
stats = importr('stats')

__author__ = 'aditya'

from flask import render_template, Blueprint, session, jsonify
from modules.opendataGet import functions

home = Blueprint("home", __name__, static_folder='static', static_url_path='/static/')

import os
import json
from config import BASE_DIR, APP_STATIC


@home.route('/')
def main():
    categories = json.loads(open(
        os.path.join(APP_STATIC, "data/categories.json"),
        "r").read())
    return render_template("index.html")



@home.route('/indData/<ind>', defaults={'y2': '2010', 'y2': datetime.now().year}, methods=['GET'])
@home.route('/indData/<ind>/<y1>', defaults={'y2': datetime.now().year}, methods=['GET'])
@home.route('/indData/<ind>/<y1>/<y2>', methods=['GET'])
def get_ind_data(y1=None, y2=None, ind=None):
    if ind:
        if y1:
            y1 = datetime(int(y1), 1, 1)
        if y2:
            y2 = datetime(int(y2), 1, 1)
        return jsonify(**functions.get_data(variable=ind, from_date=y1, to_date=y2))
    return {}


preview_countries = ['SE', 'US', 'HK', 'SG', 'IN', 'CN', 'NL', 'CH', 'AU', 'IS', 'EU', 'IE', 'BR']
@home.route('/indDataPreview/<ind>', defaults={'y1': '2010'}, methods=['GET'])
@home.route('/indDataPreview/<ind>/<y1>', methods=['GET'])
def get_ind_preview(y1=2010, ind="FR.INR.LEND"):
    if ind:
        if y1:
            ydt = datetime(int(y1), 1, 1)
        ind_details = wbdata.get_indicator(ind, display=False)[0]
        ind_details['dev'] = "Feel free to use this variable!"
        try:
            data = rpy2functions.get_values(wbdata.get_data(ind, data_date=(ydt, ydt), country=preview_countries))
            if 'q' in data.keys()[0].split('.')[0].lower():
                ind_details['dev'] = "If chosen, please make sure all variables are quarterly."
        except TypeError as e:
            data = {'{0}.{1}'.format(str(y1), cont):'ERROR' for cont in preview_countries}
            ind_details['dev'] = "No data found for this variable. Do not use this variable."
        return jsonify({'data': data, 'details': ind_details})
    return {}


@home.route('/regress', methods=['POST'])
def regress():
    if request.method == 'POST':
        data = json.loads(request.data)
        from_year, to_year, options = int(data.pop('from')), int(data.pop('to')), data.pop('options')
        highest = max(data.keys())
        indicators = {data[x]['ind']:data[x]['ind'] for x in data if 'ind' in data[x]}

        # pulls the data, removes rows with any NA (making R's life better)
        df = wbdata.get_dataframe(indicators=indicators,
                                  convert_date=True,
                                  data_date=(
                                      datetime(from_year, 1, 1),
                                      datetime(to_year, 1, 1)
                                  )).dropna()

        if not len(df):
            return jsonify({"desc": "Not enough data!", "summary": "Not enough data!"})

        lm_vectors = []
        for num in data:
            vector = FloatVector(df[data[num]['ind']])
            if num != highest:
                robjects.globalenv[str('v' + num)] = vector
            else:
                robjects.globalenv[str('res')] = vector

        # soon to be deprecated
        # rdf = com.convert_to_r_dataframe(df)
        # robjects.globalenv['rdf'] = rdf

        lmr = stats.lm("res ~ {}".format(' + '.join(['v' + str(i) for i in range(1, len(data))])))
        lmr = str(base.summary(lmr))
        lmr = lmr[lmr.find('Residuals:'):]

        vals = lmr[lmr.lower().find('(intercept)'):lmr.lower().find('---')].split('\n')
        effects = {}
        for i in range(1, len(data)):
            row, name = vals[i].split(), data[str(i)]['ind']     #is the corresponding row of this datum
            if len(row) == 6:                                    #it is significant
                effects[name] = "{0} {1}significantly affects {2} in a {3} direction.".format(
                    name,
                    {'*': '', '**': 'very ', '***': 'very very '}[row[5]],
                    data[highest]['ind'],
                    {1: 'positive', 0: 'negative'}[rpy2functions.sign(row[1])]
                )
                effects[name] += 'A single unit increase in {0}, {1} {2} by {3} units on average.'.format(
                    name,
                    {1:'increases', 0:'decreases'}[rpy2functions.sign(row[1])],
                    data[highest]['ind'],
                    rpy2functions.unsign(row[1])
                )
            else:
                effects[name] = name + " was not found to be a significant factor!"

        return jsonify({"desc": str(df.describe()), "summary": lmr, 'effects': effects})





#todo: Code cleanup