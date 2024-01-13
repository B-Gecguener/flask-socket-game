from flask import request
from flask_socketio import SocketIO, emit, join_room

io = SocketIO()

#This is the server-sided code for socket.io (server is 'io', client is 'socket')
#The following lines are the events that will be catched and answerd by the server

@io.on("connect_me")
# ^ request for connection to given room by the client
def connect_client_to_room(room):
  print("connect "+request.sid+" to "+room)
  join_room(room, sid = request.sid)
  # ^ move client into room
  io.emit("connected_to_room", to=request.sid)
  # ^ inform client about connection

@io.on("ping_to_server")
# ^ ping by client to clients room
def ping(room):
  io.emit("ping_to_client", to=room)
  # ^ send ping to room of client
  print("ping to "+room)

@io.on("chat_message")
def handle_chat_message(data):
  io.emit("chat_message", data["message"], to=data["room"])
  # ^ send message from client back to all others in clients room
  print("Deliver message '"+ data["message"]+"' to "+ data["room"])

@io.on("roll_for_turn")
def roll_for_turn(data):
  io.emit("roll_for_turn", {"team": data["team"], "roll": data["roll"] }, to=data["room"])