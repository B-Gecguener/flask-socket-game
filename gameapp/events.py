from flask import request
from flask_socketio import SocketIO, emit, join_room

io = SocketIO()

prefix = "[io-Server]: "

rooms = {}

class Player:
    def __init__(self, name, sid, team):
        self.sid = sid
        self.name = name
        self.team = team
        self.ready = False

class Room:
    def __init__(self):
        self.turn = None
        self.grid = [None, None, None, None, None, None, None, None, None]
        self.playerX = None
        self.playerO = None
    
    def checkBothReady(self):
       return (self.playerX.ready and self.playerO.ready)
          
       
    def switchTurn(self):
        if self.turn == "X": self.turn = "O"
        elif self.turn == "O": self.turn = "X"
  
    def updateGrid(self,updatePos,teamSymbol):
        self.grid[updatePos] = teamSymbol
    
    def resetGrid(self):
        self.grid = [None, None, None, None, None, None, None, None, None]
    
    def checkWinCondition(self):
        i = 0
        while i < 10: 
            i += 3
            if self.grid[i] == self.grid[i+1] and self.grid[i+1] == self.grid[i+2]:
                if self.grid[i] != "" or self.grid[i] != None:
                    return self.grid[i]
        i = 0
        while i < 4:
            i+= 1
            if self.grid[i] == self.grid[i+3] and self.grid[i+3] != self.grid[i+6]:
                if self.grid[i] != "" or self.grid[i] == None:
                    return self.grid[i]
        if self.grid[0] == self.grid[4] and self.grid[4] == self.grid[8]:
            if self.grid[0] != "" and self.grid[0] != None:
                return self.grid[0]
        if self.grid[2] == self.grid[4] and self.grid[4] == self.grid[6]:
            if self.grid[2] != "" and self.grid[2] != None:
                return self.grid[2]
        return None


# This is the server-sided code for socket.io (server is 'io', client is 'socket')
# The following lines are the events that will be catched and answerd by the server

# CONNECTION
# --------------------------------------------------------------------------------------------
@io.on("connect_me")
# ^ request for connection to given room by the client
def connect_client_to_room(data):
  room = data["room"]
  if room in rooms.keys():
    roomObj = rooms[room]
    # ^ if the Lobby exists ...
    print( prefix + "User: '"+request.sid + "' wants to connect to Room: '"+room+"'" )
    if roomObj.playerX is not None and roomObj.playerO is not None:
      #Lobby is full, inform client
      io.emit("lobby_full", to=request.sid)
      print( prefix + "Connection not possible, room already full")
    else:
      #Add Client to room
      addAndConnectPlayer(data)
  else: 
    rooms[room] = Room()
    # ^ create a new room
    print(prefix+"Creating new room")
    addAndConnectPlayer(data)
    # ^ add Client to it
    

def addAndConnectPlayer(data):
  # Handles connection of a Client
  room = data["room"]
  roomObj = rooms[data["room"]]
  opponent = None
  if roomObj.playerX == None:
    roomObj.playerX = Player(data["name"], request.sid, "X")
    player = roomObj.playerX
    # if roomObj.playerO != None:
    #   opponent = roomObj.playerO
  else:
    roomObj.playerO = Player(data["name"], request.sid, "O")
    player = roomObj.playerO
    opponent = roomObj.playerX
  # ^ add client to room
  join_room(room, sid = request.sid)
  io.emit("connected_to_room", to=player.sid)
  # ^ move client into room
  print(prefix+"successfully connected client '"+request.sid+"' to room '"+data["room"]+"'")
  outgoing = None
  if opponent != None:
     outgoing = {"player": {"sid": player.sid, "name": player.name, "team": player.team}, "opponent": {"sid": opponent.sid, "name": opponent.name, "team": opponent.team}}
     io.emit("initialize_player", outgoing, to=player.sid)
     outgoing = {"opponent": {"sid": player.sid, "name": player.name, "team": player.team}}
     io.emit("initialize_player", outgoing, to=opponent.sid)
  else:
     outgoing = {"player": {"sid": player.sid, "name": player.name, "team": player.team}}
     io.emit("initialize_player", outgoing, to=player.sid)

  # io.emit("initialize_player", {"user-sid": request.sid, "name": data["name"], "team": team}, to=data["room"])
  # io.emit("initialize_player", rooms[data["room"]].getOpponentName(request.sid) ,to=request.sid)
  # ^ inform client about connection

# PREGAME FUNCTIONS
# --------------------------------------------------------------------------------------------
@io.on("ready")
def set_player_ready(data):
  room = data["room"]
  sid = data["sid"]
  roomObj = rooms[room]

  if roomObj.playerX.sid == sid:
    roomObj.playerX.ready = True

  if roomObj.playerO.sid == sid:
    roomObj.playerO.ready = True

  if roomObj.checkBothReady():
     io.emit("start_game", to=room)
# GAME UPDATES AND SIGNALS
# --------------------------------------------------------------------------------------------  

@io.on("game_move")
def handle_game_move(data):
  # Handle incomeing game move
  if (rooms[data["room"]].getTurn() == data["team"]):
    # ^ make sure move is submitted by turntaking client
    rooms[data["room"]].updateGrid(data["gridPos"],data["team"])
    # ^ update grid of the room
    rooms[data["room"]].switchTurn()
    # ^ switch Turns
    gameUpdate(data, rooms[data["room"]].checkWinCondition())
    # ^ pass winning team and update to the gameUpdate function
    # if nobody winns, the checkWinCondition function returns None

def gameUpdate(data, winningTeam):
  # Update the lobby with the current gamestate
  io.emit("game_update", {"winning-team": winningTeam, "teams-turn": data["team"], "grid": rooms[data["room"]].getGrid()}, to=data["room"])

# CHAT
# --------------------------------------------------------------------------------------------    

@io.on("chat_message")
def handle_chat_message(data):
  room = data["room"]
  io.emit("chat_message", {"message": data["message"], "name": data["name"]}, to=room)
  # ^ send message from client back to all others in clients room
  print(prefix + "Deliver message '" + data["message"] + "' to room '" + room + "'")