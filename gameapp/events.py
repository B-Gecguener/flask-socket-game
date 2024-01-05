from flask import request
from flask_socketio import emit
import random
import string

from .extensions import io

#This is the server-sided code for socket.io (server is 'io', client is 'socket')
#The following lines are the events that will be catched and answerd by the server

@io.on("create_room")
# ^ Gets called by the Client when a new Lobby shall be created
def handle_room_creation():
    room_link = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(6)) 
    # ^ generates random lobbylink out of letters and numbers
    emit('room_created', {'lobby_link': room_link}, room=request.sid) 
    # ^ sends the link back to the calling Client

io.on()