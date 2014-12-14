__author__ = 'aditya'

import rpy2.rinterface as ri

def get_values(indicator_data):
    # Cant use tuples (yay, Flask!)
    return {i['date'] + "." + i['country']['id']: i['value'] for i in indicator_data}

def regress(dep, factors):
    tosend = set(dep).intersection(set(factors))
    