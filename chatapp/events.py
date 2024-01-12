from flask import request
from flask_socketio import emit
import random
import string

from .extensions import io

users = {}

@io.on("create_lobby")
def handle_create_lobby():
    lobby_link = generate_lobby_link()
    emit('lobby_created',{'lobby_link': lobby_link }, broadcast=True)

def generate_lobby_link():
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(20))

@io.on("connect")
def handle_connect():
    print("Client connected!")

@io.on("user_join")
def handle_user_join(username):
    print(f"User {username} joined!")
    users[username] = request.sid

@io.on("new_message")
def handle_new_message(message):
    print(f"New message: {message}")
    username = None
    for user in users:
        if users[user] == request.sid:
            username = user
    emit("chat", {"message": message, "username": username}, broadcast=True)