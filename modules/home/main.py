from datetime import datetime

from flask import request
import wbdata
from helper import debug_response_main

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
            if len(data) < 5:
                ind_details['dev'] = "Very scarce data. Avoid using this variable."
        except TypeError as e:
            data = {'{0}.{1}'.format(str(y1), cont):'ERROR' for cont in preview_countries}
            ind_details['dev'] = "No data found for this variable. Do not use this variable."
        return jsonify({'data': data, 'details': ind_details})
    return {}


@home.route('/regress', methods=['POST'])
def regress(debug = True):
    if request.method == 'POST':
        if debug:
            return jsonify(debug_response_main)
        try:
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
                return jsonify({"desc": "Not enough data!",
                                "summary": "Not enough data!",
                                'effects': {'info': "Not enough data!"}, 'error': 0})

            lm_vectors, mapData = [], {}
            for num in data:
                ind_name = data[num]['ind']
                vector = FloatVector(df[ind_name])
                if num != highest:
                    robjects.globalenv[str('v' + num)] = vector
                else:
                    robjects.globalenv[str('res')] = vector
                    desc = json.loads(get_ind_preview(2010, ind_name).data)
                # Store it in the server side session.
                keys = map(functions.make_key, df[ind_name].keys())
                session[ind_name] = [{keys[i]: df[ind_name][i] for i in range(len(keys))}]
                mapData[ind_name] = {}
                for key in df[ind_name].keys():
                    if functions.get_country_code(key[0]):
                        mapData[ind_name].setdefault(key[1].year, {})[functions.get_country_code(key[0])] = df[ind_name][key]

            effects = {'count': str(len(df)) + ' rows of data were used for the analysis.'}
            lmr = stats.lm("res ~ {}".format(' + '.join(['v' + str(i) for i in range(1, len(data))])))
            lmr = str(base.summary(lmr))
            lmr = lmr[lmr.find('Residuals:'):]

            lda = {}
            if options['lda']:
                try:
                    robjects.r('qres1 <- quantile(res)')
                    robjects.r('qres <- cut(res, qres1, labels=c(1,2,3,4), include.lowest=TRUE)')
                    importr('MASS')
                    robjects.r("mylda <- lda(qres ~ {})".format(' + '.join(['v' + str(i) for i in range(1, len(data))])))
                    lda_pie = list(robjects.r("mylda$svd^2/sum(mylda$svd^2) * 100"))
                    lda_means = list(robjects.r("mylda$means"))
                    robjects.r("lda_preds <- predict(mylda, as.table(cbind({})))".format(','.join(['v' + str(i) for i in range(1, len(data))])))
                    lda_class_success = robjects.r('mean(as.numeric(lda_preds$class) == qres)')
                    lda = {'lda_pie': lda_pie, 'lda_means': lda_means, 'lda_class_success': float(lda_class_success[0]) * 100}
                    effects['lda_success'] = "LDA classification on " + data[highest]['ind'] + " had an accuracy of  " + str(lda['lda_class_success']) + " %."
                except Exception as lda_e:
                    lda = {'error': lda_e.message}

            vals = lmr[lmr.lower().find('(intercept)'):lmr.lower().find('---')].split('\n')

            for i in range(1, len(data)):
                row, name = vals[i].split(), data[str(i)]['ind']     #is the corresponding row of this datum
                if len(row) == 6:                                    #it is significant
                    effects[name] = "{0} {1}significantly affects {2} in a {3} direction.".format(
                        name,
                        {'*': '', '**': 'very ', '***': 'very very '}[row[5]],
                        data[highest]['ind'],
                        {1: 'positive', 0: 'negative'}[rpy2functions.sign(row[1])]
                    )
                    effects[name] += ' A single unit increase in {0}, {1} {2} by {3} units on average.'.format(
                        name,
                        {1:'increases', 0:'decreases'}[rpy2functions.sign(row[1])],
                        data[highest]['ind'],
                        rpy2functions.unsign(row[1])
                    )
                else:
                    effects[name] = name + " was not found to be a significant factor!"
                response = {"desc": str(df.describe()), "summary": lmr, 'effects': effects, 'error': 0,
                            'mapData': mapData, 'lda': lda, 'desc2': desc}
            return jsonify(response)
        except Exception as e:
            return jsonify({'error': 1,
                            'err_msg': 'There was an error. Trace attached:',
                            'trace': '\n'.join(e.args) + e.message})


#todo: Code cleanup