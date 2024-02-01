from flask_admin.contrib.sqla import ModelView
from flask_security.models import fsqla
from gameapp import db, admin


fsqla.FsModels.set_db_info(db)

class Role(db.Model, fsqla.FsRoleMixin):
    pass

class User(db.Model, fsqla.FsUserMixin):
    pass

admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Role, db.session))