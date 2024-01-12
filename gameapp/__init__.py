from flask import Flask
from .events import io
# from .routes import main
app = Flask(__name__)
app.config['STATIC_FOLDER'] = "static"
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "secret"

io.init_app(app)

from gameapp import routes