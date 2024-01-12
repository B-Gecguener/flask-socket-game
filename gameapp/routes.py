from flask import Blueprint, render_template

main = Blueprint("main", __name__)

@main.route('/')
def index():
    return render_template("index.html")

@main.route("/game/<lobbyID>")
def game(lobbyID):
    return render_template("game.html", room=lobbyID)