from flask import Flask
from flask_admin import Admin
from .events import io
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


app = Flask(__name__)
#ruft config.py auf
app.config.from_object('config')

io.init_app(app)

admin = Admin(name='gameapp', template_mode='bootstrap3')
admin.init_app(app)

from gameapp import routes