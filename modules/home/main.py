from datetime import datetime

from flask import request
import wbdata


import rpy2.robjects as robjects
from rpy2.robjects import FloatVector
from rpy2.robjects.packages import importr
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


@home.route('/regress', methods=['POST'])
def regress():
    if request.method == 'POST':
        data = json.loads(request.data)
        from_year, to_year = int(data.pop('from')), int(data.pop('to'))
        highest = max(data.keys())
        indicators = {data[x]['ind']:data[x]['ind'] for x in data}

        # pulls the data, removes rows with any NA (making R's life better)
        df = wbdata.get_dataframe(indicators=indicators,
                                  convert_date=True,
                                  data_date=(
                                      datetime.strptime("1/1/" + str(from_year), "%d/%m/%Y"),
                                      datetime.strptime("1/1/" + str(to_year), "%d/%m/%Y") # ,datetime.now())
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
        return jsonify({"desc": str(df.describe()), "summary": str(base.summary(lmr))})






