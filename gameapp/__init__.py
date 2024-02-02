from flask import Flask
from flask_admin import Admin
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_security import Security, SQLAlchemyUserDatastore

app = Flask(__name__)

#ruft config.py auf
app.config.from_object('config')

#Datenbank initialisierung
db = SQLAlchemy()
db.init_app(app)
migrate = Migrate()
migrate.init_app(app, db)

admin = Admin(name='gameapp', template_mode='bootstrap3')
admin.init_app(app)

from .models import Role, User
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
app.security = Security(app, user_datastore)

io = SocketIO()
io.init_app(app)


from gameapp import routes, events