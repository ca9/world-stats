__author__ = 'aditya'

import wbdata,datetime,time
from flask import session
from modules.rpy2_wrap import functions


def get_countries():
    session['countries'] = wbdata.get_country(display=False)
    return session['countries']


def get_data(from_date=datetime.datetime(2010, 1, 1), to_date=datetime.datetime.now(), variable="FR.INR.LEND"):
    duration = (from_date, to_date)
    print "called"
    t0 = time.time()
    session['data'] = functions.get_values(wbdata.get_data(variable, data_date=duration))
    t1 = time.time()
    session['dep'] = functions.get_values(wbdata.get_data("FR.INR.RINR", data_date=duration))
    t2 = time.time()
    print "time", t2 - t1, t1 - t0, t2 - t0
    print session['dep']
    print session['data']
    print len(session['dep']), len(session['data'])
    return session['data']


def get_all():
    get_countries()
    get_data()
    return

