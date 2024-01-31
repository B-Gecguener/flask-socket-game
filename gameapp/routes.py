from flask import render_template, request, redirect, url_for
from gameapp import app
import string, random


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        room = request.form['room']

        if room == "" or room == None:
            room = createLobbyLink()

        # return redirect('/game/{room}')
        return redirect(url_for('game', lobbyID = room, name = name))
    else:
        return render_template("index.html")

@app.route("/game/<lobbyID>/<name>")
def game(lobbyID, name):
    return render_template("game.html", room = lobbyID, name = name)

def createLobbyLink():
    characters = string.ascii_letters + string.digits
    random_string = ''.join(random.choice(characters) for i in range(8))
    return random_string

