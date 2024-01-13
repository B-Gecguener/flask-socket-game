from flask import render_template
from gameapp import app


@app.route('/')
def index():
    return render_template("index.html")

@app.route("/game/<lobbyID>")
def game(lobbyID):
    return render_template("game.html", room=lobbyID)