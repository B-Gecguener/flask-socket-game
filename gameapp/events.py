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
    
    def getTeam(self):
       return self.team
    
    def getReady(self):
       return self.ready
    
    def setReady(self, newStatus):
       self.ready = newStatus
    
    def getName(self):
       return self.name
    
    def setName(self, newName):
       self.name = newName

    def getSid(self):
       return self.sid
    


class Room:

    def __init__(self):
        self.turn = None
        self.grid = [None, None, None, None, None, None, None, None, None]
        self.player1 = None
        self.player2 = None
    
    def openSpace(self):
        if self.player1 == None:
          return True
        elif self.player2 == None:
           return True
        else: return False
    
    def updateReadyStatus(self, sid, status):
       if sid == self.player1.getSid():
          self.player1.setReady(status)
       if sid == self.player2.getSid():
          self.player2.setReady(status)
    
    def checkBothReady(self):
       return (self.player1.ready and self.player2.ready)
          
    def getPlayer(self, i):
      if i == 1:
        return self.player1
       
      if i == 2:
        return self.player2
       

    def getOpponentName(self, wrongSid):
       if self.player1 != None:
        if self.player1.getSid() != wrongSid:
          return {"user-sid": self.player1.getSid(), "name": self.player1.getName()}
       elif self.player2 != None: 
          if self.player2.getSid() != wrongSid:
            return {"user-sid": self.player2.getSid(), "name": self.player1.getName()}
       return False
      
    def getTurn(self):
        return self.turn
    
    def switchTurn(self):
        if self.turn == "X": self.turn = "O"
        elif self.turn == "O": self.turn = "X"
    
    def getUnusedTeam(self):
        team = "X"
        if self.player1 != None:
           if self.player1.getTeam() == "X":
              team = "O"
        elif self.player2 != None:
           if self.player2.getTeam() == "X":
              team = "O"
        return team
    
    def updateGrid(self,updatePos,teamSymbol):
        self.grid[updatePos] = teamSymbol
    
    def resetGrid(self):
        self.grid = [None, None, None, None, None, None, None, None, None]
    
    def getGrid(self):
        return self.grid
    
    def addPlayer(self, player):
        if self.player1 == None:
           self.player1 = player
        elif self.player2 == None:
           self.player2 = player
    
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
    # ^ if the Lobby exists ...
    print( prefix + "User: '"+request.sid + "' wants to connect to Room: '"+room+"'" )
    if not rooms[room].openSpace():
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
  team = rooms[data["room"]].getUnusedTeam()
  room = data["room"]
  roomObj = rooms[data["room"]]
  opponent = None
  if roomObj.player1 == None:
    roomObj.player1 = Player(data["name"], request.sid, team)
    player = roomObj.player1
    # if roomObj.player2 != None:
    #   opponent = roomObj.player2
  else:
    roomObj.player2 = Player(data["name"], request.sid, team)
    player = roomObj.player2
    opponent = roomObj.player1
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

  if roomObj.player1.sid == sid:
    roomObj.player1.ready = True

  if roomObj.player2.sid == sid:
    roomObj.player2.ready = True

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

# CHAT AND NAMES
# --------------------------------------------------------------------------------------------    
@io.on("my_name")
def name_recieved(data):
  print(prefix+"name of user recieved")
  io.emit("name", {"user-sid": request.sid, "name": data["name"]}, to=data["for"])
  # ^ send names back to requester

@io.on("ping_to_server")
# ^ ping by client to clients room
def ping(room):
  io.emit("ping_to_client", to=room)
  # ^ send ping to room of client
  print(prefix+"ping to '"+room+"'")

@io.on("chat_message")
def handle_chat_message(data):
  room = data["room"]
  io.emit("chat_message", {"message": data["message"], "name": data["name"]}, to=room)
  # ^ send message from client back to all others in clients room
  print(prefix + "Deliver message '" + data["message"] + "' to room '" + room + "'")