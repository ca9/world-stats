__author__ = 'aditya'

import wbdata,datetime,time
from flask import session
from modules.rpy2_wrap import functions

def get_countries():
    session['countries'] = wbdata.get_country(display=False)
    return session['countries']


def get_data(from_date=datetime.datetime(2010, 1, 1), to_date=datetime.datetime.now(), variable="FR.INR.LEND"):
    duration = (from_date, to_date)
    variable = variable.upper()
    mykey = '-'.join(map(str, [from_date.year, to_date.year, variable]))
    return functions.get_values(wbdata.get_data(variable, data_date=duration))

    # this attaches data to every message as cookie, slowing down the system. Dont use this.
    # if mykey not in session:
    #     session[mykey] = functions.get_values(wbdata.get_data(variable, data_date=duration))
    # return session[mykey]


def get_categories():
    categories = [(x['id'], x['name']) for x in wbdata.get_source(display=False)]
    return categories

def get_indicators(i, name):
    indicators = wbdata.get_indicator(source = i, display=False)
    return indicators
