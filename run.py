from flask import Flask
from modules.home.main import home

# Very important for Jinja to not clash with Angular JS
from flask.ext.triangle import Triangle


# Get app and Config
app = Flask(__name__)
app.config.from_object('config')

#Lord save us from Jinja
Triangle(app)

# Blueprints
app.register_blueprint(home)

# All set.
if __name__ == '__main__':
    app.run(debug = True)





