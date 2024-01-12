from flask import request
from flask_socketio import emit, join_room
import random
import string

from .extensions import io

#This is the server-sided code for socket.io (server is 'io', client is 'socket')
#The following lines are the events that will be catched and answerd by the server

@io.on("connect_me")
def connect_client_to_room(room):
  join_room(room, sid = request.sid)
  # ^ move client into created room
  io.emit("connected_to_room", to=request.sid)

@io.on("ping_to_server")
def ping(room):
  io.emit("ping_to_client", to=room)
  print("ping to "+room)