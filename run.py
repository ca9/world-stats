from flask import Flask, render_template
from modules.home.main import home

# Get app and Config
app = Flask(__name__)
app.config.from_object('config')

# Blueprints
app.register_blueprint(home)

# All set.
if __name__ == '__main__':
    app.run(debug = True)





