__author__ = 'aditya'

from flask import render_template, Blueprint
from modules.opendataGet import functions

home = Blueprint("home", __name__)

@home.route('/')
def main():
    functions.get_all()
    print "done"
    return render_template("index.html")



