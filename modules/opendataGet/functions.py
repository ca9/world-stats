__author__ = 'aditya'

import wbdata,datetime,time
from flask import session
from modules.rpy2_wrap import functions

def get_countries():
    if 'countries' not in session:
        session['countries'] = wbdata.get_country(display=False)
    return session['countries']

def make_key(oldkey):
    year, id = oldkey[1].year, 'XX'
    for x in get_countries():
        if oldkey[0] == x['name']:
            id = x['iso2Code']
    if id:
        return id + '.' + str(year)

jvector_countries = {'BD', 'BE', 'BF', 'BG', 'BA', 'BN', 'BO', 'JP', 'BI', 'BJ', 'BT', 'JM', 'BW', 'BR', 'BS', 'BY',
                     'BZ', 'RU', 'RW', 'RS', 'LT', 'LU', 'LR', 'RO', 'GW', 'GT', 'GR', 'GQ', 'GY', 'GE', 'GB', 'GA',
                     'GN', 'GM', 'GL', 'KW', 'GH', 'OM', '_1', '_0', 'JO', 'HR', 'HT', 'HU', 'HN', 'PR', 'PS', 'PT',
                     'PY', 'PA', 'PG', 'PE', 'PK', 'PH', 'PL', '-99', 'ZM', 'EH', 'EE', 'EG', 'ZA', 'EC', 'AL', 'AO',
                     'KZ', 'ET', 'ZW', 'ES', 'ER', 'ME', 'MD', 'MG', 'MA', 'UZ', 'MM', 'ML', 'MN', 'MK', 'MW', 'MR',
                     'UG', 'MY', 'MX', 'VU', 'FR', 'FI', 'FJ', 'FK', 'NI', 'NL', 'NO', 'NA', 'NC', 'NE', 'NG', 'NZ',
                     'NP', 'CI', 'CH', 'CO', 'CN', 'CM', 'CL', 'CA', 'CG', 'CF', 'CD', 'CZ', 'CY', 'CR', 'CU', 'SZ',
                     'SY', 'KG', 'KE', 'SS', 'SR', 'KH', 'SV', 'SK', 'KR', 'SI', 'KP', 'SO', 'SN', 'SL', 'SB', 'SA',
                     'SE', 'SD', 'DO', 'DJ', 'DK', 'DE', 'YE', 'AT', 'DZ', 'US', 'LV', 'UY', 'LB', 'LA', 'TW', 'TT',
                     'TR', 'LK', 'TN', 'TL', 'TM', 'TJ', 'LS', 'TH', 'TF', 'TG', 'TD', 'LY', 'AE', 'VE', 'AF', 'IQ',
                     'IS', 'IR', 'AM', 'IT', 'VN', 'AR', 'AU', 'IL', 'IN', 'TZ', 'AZ', 'IE', 'ID', 'UA', 'QA', 'MZ'}
def get_country_code(name):
    for x in get_countries():
        if name == x['name']:
            if x['iso2Code'] in jvector_countries:
                return x['iso2Code'] 
    return None

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


