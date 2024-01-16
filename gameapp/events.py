from flask import request
from flask_socketio import SocketIO, emit, join_room

io = SocketIO()

prefix = "[io-Server]: "

#This is the server-sided code for socket.io (server is 'io', client is 'socket')
#The following lines are the events that will be catched and answerd by the server

@io.on("connect_me")
# ^ request for connection to given room by the client
def connect_client_to_room(room):
  print(prefix+"connect client '"+request.sid+"' to room '"+room+"'")
  join_room(room, sid = request.sid)
  # ^ move client into room
  io.emit("get_name", {"for": request.sid, "toUser": "true"}, to=room)
  # ^ get all names from rooms clients
  io.emit("connected_to_room", to=request.sid)
  # ^ inform client about connection

io.on("my_name")
def name(data):
  if (data["toUser"] == "true"):
    io.emit("lobby_names", {"user-sid": request.sid, "name": data["name"]}, to=data["for"])
    # ^ send names back to requester
  elif (data["toUser"] == "false"): 
    io.emit("lobby_names", {"user-sid": request.sid, "name": data["name"]}, to=data["for"])
    # ^ send names back to room

@io.on("ping_to_server")
# ^ ping by client to clients room
def ping(room):
  io.emit("ping_to_client", to=room)
  # ^ send ping to room of client
  print(prefix+"ping to '"+room+"'")

@io.on("chat_message")
def handle_chat_message(data):
  io.emit("chat_message", {"message": data["message"], "user": request.sid}, to=data["room"])
  # ^ send message from client back to all others in clients room
  print(prefix+"Deliver message '"+ data["message"]+"' to room '"+ data["room"]+"'")

@io.on("roll_for_turn")
def roll_for_turn(data):
  # ^ send that teams roll to the room, needed to decide whos first
  print(prefix+"roll '"+str(data["roll"])+"' recived from room '"+data["room"]+"'")
  io.emit("roll_for_turn", {"team": data["team"], "roll": data["roll"] }, to=data["room"])

@io.on("make_ready")
def make_ready(data):
  # ^ this informs the room about your teams new ready-status
  print(prefix+"emitting room '"+data["room"]+"'s Team '"+str(data["team"])+"' ready-status is '"+str(data["status"])+"'")
  io.emit("make_ready", {"team": data["team"], "status": data["status"]}, to=data["room"])

@io.on("start_game")
def start_game(room):
  # ^ this checks
  print(prefix+"game start in room '"+room+"'")
  io.emit("start", to=room)