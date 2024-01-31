from flask import Flask
from flask_admin import Admin
from .events import io
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_migrate import Migrate


app = Flask(__name__)
#ruft config.py auf
app.config.from_object('config')

class Base(DeclarativeBase):
    pass
db = SQLAlchemy(model_class=Base)
db.init_app(app)

io.init_app(app)

admin = Admin(name='gameapp', template_mode='bootstrap3')
admin.init_app(app)

from gameapp import routes