__author__ = 'aditya'

import rpy2.rinterface as ri

def get_values(indicator_data):
    # Cant use tuples (yay, Flask!)
    return {i['date'] + "." + i['country']['id']: i['value'] for i in indicator_data}

def regress(dep, factors):
    tosend = set(dep).intersection(set(factors))

def sign(a):
    return not a[0]=='-'

def unsign(a):
    if a[0] == '-':
        return a[1:]
    return a