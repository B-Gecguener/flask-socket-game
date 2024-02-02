from flask_admin.contrib.sqla import ModelView
from flask_security.models import fsqla
from gameapp import db, admin


fsqla.FsModels.set_db_info(db)

class Role(db.Model, fsqla.FsRoleMixin):
    pass

class User(db.Model, fsqla.FsUserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=True)
    wins = db.Column(db.Integer, default=0)
    loses = db.Column(db.Integer, default=0)
    

admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Role, db.session))