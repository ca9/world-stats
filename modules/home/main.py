from datetime import datetime

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






