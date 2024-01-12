from flask import Flask
from flask_admin import Admin
from .events import io
from .routes import main
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    #ruft config.py auf
    app.config.from_object('config')
    

    app.register_blueprint(main)
    io.init_app(app)
    
    admin = Admin(name='gameapp', template_mode='bootstrap3')
    admin.init_app(app)

    return app