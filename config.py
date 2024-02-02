STATIC_FOLDER = 'static'
DEBUG = True
#security key generated with secrets.token_urlsafe() im python terminal
SECRET_KEY = 'LaxqPujoTuBWe_ItffuuaX0I5xtbMlHDDBPJVsnoyus'
FLASK_ADMIN_SWATCH = 'cerulean'
SQLALCHEMY_DATABASE_URI = 'sqlite:///database.sqlite'
SECURITY_PASSWORD_SALT = '83490012044624960290587214006001089620'
SECURITY_REGISTERABLE = True
SECURITY_SEND_REGISTER_EMAIL = False
SECURITY_USERNAME_ENABLE = True

# Eigentlich sollte config nicht bei git hochgeladen werden weil hier
# die security keys drin sind