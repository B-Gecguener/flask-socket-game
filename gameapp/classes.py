class Player:
    def __init__(self, name, sid, team):
        self.sid = sid
        self.name = name
        self.team = team
        self.ready = False

class Room:
    def __init__(self):
        self.turn = None
        self.grid = ["", "", "", "", "", "", "", "", ""]
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
        self.grid = ["", "", "", "", "", "", "", "", ""]
    
    def checkWinCondition(self):
        i = 0
        while i < 9: 
            if self.grid[i] == self.grid[i+1] == self.grid[i+2]:
                if self.grid[i] != "":
                    return self.grid[i]
            i += 3
        i = 0
        while i < 3:
            if self.grid[i] == self.grid[i+3] == self.grid[i+6]:
                if self.grid[i] != "":
                    return self.grid[i]
            i += 1
            
        if self.grid[0] == self.grid[4] and self.grid[4] == self.grid[8]:
            if self.grid[0] != "":
                return self.grid[0]
        if self.grid[2] == self.grid[4] and self.grid[4] == self.grid[6]:
            if self.grid[2] != "":
                return self.grid[2]
        i = 0
        while i < 9:
            if self.grid[i] == "":
                return None
            i += 1
        return "tie"