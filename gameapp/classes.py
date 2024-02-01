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
    
    def bothReady(self):
       return (self.player1.getReady() and self.player2.getReady())
          
       

    def getOpponentName(self, wrongSid):
       if self.player1 != None:
        if self.player1.getSid() != wrongSid:
          return {"user-sid": self.player1.getSid(), "name": self.player1.getName()}
       elif self.player2 != None: 
          if self.player2.getSid() != wrongSid:
            return {"user-sid": self.player2.getSid(), "name": self.player1.getName()}

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