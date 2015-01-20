__author__ = 'aditya'

from flask import render_template, Blueprint, session
from modules.opendataGet import functions

home = Blueprint("home", __name__)

import os, json
from config import BASE_DIR, APP_STATIC


@home.route('/')
def main():
    categories = json.loads(open(
        os.path.join(APP_STATIC,
                     "data/categories.json"),
        "r").read())
    return render_template("index.html",
                           categories=categories)



