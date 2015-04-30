from flask import Flask
from modules.home.main import home
from modules.sqlite.sqliteInterface import SqliteSessionInterface
import os

# Very important for Jinja to not clash with Angular JS
from flask.ext.triangle import Triangle

# Get app and Config
app = Flask(__name__)
app.config.from_object('config')

sqlite_path = 'modules/sqlite/sessions'

from sys import platform as _platform
if _platform == 'darwin':
    sqlite_path = os.path.join(app.config.get('BASE_DIR'), sqlite_path)

os.chmod(sqlite_path, int('700', 8))
app.session_interface = SqliteSessionInterface(sqlite_path)

#Lord save us from Jinja
Triangle(app)

# Blueprints
app.register_blueprint(home)

# All set.
if __name__ == '__main__':
    app.run(debug = True, host='0.0.0.0')





