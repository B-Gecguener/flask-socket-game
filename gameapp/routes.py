from flask import render_template, request, redirect, url_for
from gameapp import app, db
import string, random, re
from flask_security import current_user

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = sanitize_input(request.form['name'])
        current_user.username = name
        db.session.commit()
        room = sanitize_input(request.form['room'])

        if room == "" or room == None:
            room = createLobbyLink()

        # return redirect('/game/{room}')
        return redirect(url_for('game', lobbyID = room, name = name))
    else:
        if current_user.is_authenticated and current_user.username!=None:
            username = current_user.username
            return render_template("index.html", username = username)
        else:
            return render_template("index.html", username = "")
    

@app.route("/game/<lobbyID>")
def redirect_to_index_with_lobby(lobbyID):
    return redirect("/"+lobbyID)

@app.route("/<lobbyID>")
def index_with_lobby(lobbyID):
    return render_template("index.html", room = lobbyID)
    

@app.route("/game/<lobbyID>/<name>")
def game(lobbyID, name):
    if current_user.is_authenticated:
        return render_template("game.html", 
                                room = lobbyID, 
                                name = name, 
                                isAuthenticated = "true")
    else: 
        return render_template("game.html", 
                                room = lobbyID, 
                                name = name, 
                                isAuthenticated = "false")

@app.route("/profile")
def profile():
    return render_template("profile.html")

def createLobbyLink():
    characters = string.ascii_letters + string.digits
    random_string = ''.join(random.choice(characters) for i in range(8))
    return random_string

def sanitize_input(input_string):
    allowed_characters = re.compile(r'[a-zA-Z0-9_\-.,\s]+')
    sanitized_string = ''.join(allowed_characters.findall(input_string))

    return sanitized_string

