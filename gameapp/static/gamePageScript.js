//--This is the script for the gamepage
let socketPrefix = "[socket]: ";
//--Global Game Variables
//Ready Boolean
//TurnBoolean, if true, its clients turn
let isMyTurn = false;
let playerScore = 0;
let opponentScore = 0;
let grid = ["", "", "", "", "", "", "", "", ""];
//Name List
let tileElems = [];
let player = null;
let opponent = null;
let userIsAuthenticated = false;
//--On-Load Wrapper
document.addEventListener("DOMContentLoaded", function () {
  //This wrapper-function ensures, that the websocket connects after the whole document was loaded
  const socket = io.connect();
  connectToRoom(room);

  //--Stats
  //These are the html elements and their respective classes
  //that should be changed depending on the game state:

  let statsPlayerElem = document.getElementById("stats-player");
  let statsOpponentElem = document.getElementById("stats-opponent");

  //"turn-indicator" depending on which turn it is
  let labelPlayerElem = statsPlayerElem.children[0];
  let labelOpponentElem = statsOpponentElem.children[0];

  //"red" "green" depending on which team it is
  let namePlayerElem = statsPlayerElem.children[1];
  let nameOpponentElem = statsOpponentElem.children[1];

  //depending on how many wins a player has
  let scorePlayerElem = statsPlayerElem.children[2];
  let scoreOpponentElem = statsOpponentElem.children[2];

  let messageElem = document.getElementById("message");

  let gameBoardElem = document.getElementById("game-board");
  let readyButtonElem = document.getElementById("ready-button");
  let gameTextElem = document.getElementById("game-text");

  let turnOverlayElem = document.getElementById("turn-overlay");
  let userStatsElem;
  let userStatsNameElem;
  let userStatsWinsElem;
  let userStatsLosesElem;

  console.log("auth = " + isAuthenticated);
  if (isAuthenticated == true) {
    userStatsElem = document.getElementById("user-stats");
    userStatsNameElem = userStatsElem.children[0];
    userStatsWinsElem = userStatsElem.children[1];
    userStatsLosesElem = userStatsElem.children[2];
  } else {
    console.log("is not auth");
  }

  readyButtonElem.addEventListener("click", readyUp);
  messageElem.addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      sendChatMessage();
    }
  });

  //--Connect to room
  function connectToRoom(room) {
    //Call this apon connecting to the game room
    //Moves the client into a socket.io room, which is later used to broadcast the gamechanges to all clients in this lobby / room
    socket.emit("connect_me", { room: room, name: name });
    console.log(socketPrefix + "asking for connection on " + room);
  }

  socket.on("connected_to_room", function () {
    console.log(socketPrefix + "successfully connected to " + room + "!");
  });

  socket.on("lobby_full", function () {
    console.log(socketPrefix + "room is full");
    alert("Room is full. Please create another one.");
    window.location = "/";
  });

  socket.on("initialize_player", function (data) {
    console.log("initialize a player");
    if ("opponent" in data) {
      opponent = data.opponent;
      console.log(socketPrefix + "My Opponent is " + opponent.name);
    }
    if ("player" in data) {
      player = data.player;
      console.log(socketPrefix + "I'm: " + player.name);
      if (player.team == "X") {
        namePlayerElem.classList.add("green");
        nameOpponentElem.classList.add("red");
      } else {
        namePlayerElem.classList.add("red");
        nameOpponentElem.classList.add("green");
      }
      if (isAuthenticated) {
        userStatsNameElem.innerText = player.name;
      }
    }
    displayNames();
  });
  function displayNames() {
    namePlayerElem.innerText = player.name;

    if (opponent != null) {
      statsOpponentElem.classList.remove("hidden");
      nameOpponentElem.innerText = opponent.name;
    }
  }

  //--Chat
  function sendChatMessage() {
    //This sends the provided string as a message to the lobbys chat
    let message = document.getElementById("message").value;
    // ^ get the message string out of the input line
    socket.emit("chat_message", {
      message: message,
      name: player.name,
      room: room,
    });
    // ^ send message to the room, the socket is in
    document.getElementById("message").value = "";
    console.log(
      socketPrefix + "Message send to room: " + room + " message:" + message
    );
  }
  //Listen for chatmessages
  socket.on("chat_message", function (data) {
    console.log(
      socketPrefix +
        "Recived Message from server: " +
        data.message +
        "name: " +
        data.name
    );
    var parentElem = document.getElementById("messages");
    var msgElem = document.createElement("div");
    var nameElem = document.createElement("p");
    var grdBottom = document.getElementById("grd-bottom");
    nameElem.appendChild(document.createTextNode(data.name + ": "));

    var contentElem = document.createElement("p");
    contentElem.appendChild(document.createTextNode(data.message));

    msgElem.appendChild(nameElem);
    msgElem.appendChild(contentElem);

    parentElem.appendChild(msgElem);
    parentElem.scrollTop = parentElem.scrollHeight;

    parentElem.addEventListener("scroll", (event) => {
      let oH = event.target.offsetHeight;
      let sT = event.target.scrollTop;
      let sH = event.target.scrollHeight;
      let scrollBottom = sH - sT - oH;
      if (scrollBottom == 0) {
        grdBottom.classList.add("hidden");
      } else {
        grdBottom.classList.remove("hidden");
      }
    });

    // ^ Filling the chat with the message that was recieved
  });

  //--Game code
  //Toggle between ready and unready
  function readyUp() {
    socket.emit("ready", {
      sid: player.sid,
      room: room,
    });
    gameTextElem.innerText = "Waiting for opponent...";
    readyButtonElem.classList.add("hidden");
    console.log("ready up");
  }

  socket.on("start_game", function (starter) {
    if (player.team == starter) {
      isMyTurn = true;
      turnOverlayElem.classList.add("hidden");
    }

    console.log("game started");
    gameTextElem.classList.add("hidden");
    readyButtonElem.classList.add("hidden");
    gameBoardElem.classList.remove("hidden");
  });

  // Makes tileElems on the gameboard clickable
  tileElems = [...document.getElementsByClassName("tile")];

  for (let i = 0; i < tileElems.length; i++) {
    tileElems[i].addEventListener("click", tileClicked);
  }

  function tileClicked(e) {
    console.log("clicked" + isMyTurn);
    cl = e.target.classList;
    if (isMyTurn && cl.contains("empty")) {
      isMyTurn = false;
      console.log("clicked and its my turn");

      let index = tileElems.indexOf(e.target);

      if (player.team == "X") {
        cl.remove("empty");
        cl.add("cross");
        grid[index] = "X";
      }
      if (player.team == "O") {
        cl.remove("empty");
        cl.add("circle");
        grid[index] = "O";
      }
      socket.emit("game_move", {
        grid: grid,
        team: player.team,
        room: room,
      });
      setTimeout(() => {
        if (!isMyTurn) {
          turnOverlayElem.classList.remove("hidden");
        }
      }, 1000);
    }
  }

  socket.on("game_update", function (data) {
    grid = data.grid;
    for (let i = 0; i < tileElems.length; i++) {
      if (grid[i] == "X") {
        tileElems[i].classList.remove("empty");
        tileElems[i].classList.add("cross");
      }
      if (grid[i] == "O") {
        tileElems[i].classList.remove("empty");
        tileElems[i].classList.add("circle");
      }
    }
    isMyTurn = true;
    turnOverlayElem.classList.add("hidden");
  });
  socket.on("win_update", function (data) {
    grid = data.grid;
    winner = data.winner;

    for (let i = 0; i < tileElems.length; i++) {
      if (grid[i] == "X") {
        tileElems[i].classList.remove("empty");
        tileElems[i].classList.add("cross");
      }
      if (grid[i] == "O") {
        tileElems[i].classList.remove("empty");
        tileElems[i].classList.add("circle");
      }
    }

    turnOverlayElem.classList.add("hidden");
    console.log("game over");
    setTimeout(() => {
      showEndScreen(winner);
    }, 2500);
  });

  function showEndScreen(winner) {
    if (winner == player.team) {
      socket.emit("update_db", true);
      gameTextElem.innerHTML = "You won! </br> Wanna play again?";
      playerScore++;
      scorePlayerElem.innerText = playerScore;
    } else if (winner == "tie") {
      gameTextElem.innerHTML = "It's a tie! </br> Wanna play again?";
    } else {
      socket.emit("update_db", false);
      gameTextElem.innerHTML = "You lost! </br> Wanna play again?";
      opponentScore++;
      scoreOpponentElem.innerText = opponentScore;
    }
    grid = ["", "", "", "", "", "", "", "", ""];
    for (let i = 0; i < tileElems.length; i++) {
      tileElems[i].classList.remove("empty");
      tileElems[i].classList.remove("circle");
      tileElems[i].classList.remove("cross");

      tileElems[i].classList.add("empty");
    }

    turnOverlayElem.classList.remove("hidden");
    gameTextElem.classList.remove("hidden");

    readyButtonElem.classList.remove("hidden");
    gameBoardElem.classList.add("hidden");
  }

  socket.on("wins_and_loses", function (data) {
    if (isAuthenticated) {
      userStatsWinsElem.innerText = "Wins: " + data.wins;
      userStatsLosesElem.innerText = "Loses: " + data.loses;
    }
  });

  //--Share
  let shareButton = document.getElementById("share-button");
  shareButton.addEventListener("click", shareClicked);

  function shareClicked() {
    let link = removeLastDirectoryPartOf(window.location.href);

    navigator.clipboard.writeText(link);
    console.log("copied link: " + link);
    shareButton.children[0].classList.remove("share-icon");
    shareButton.children[0].classList.add("check-icon");
    setTimeout(() => {
      shareButton.children[0].classList.remove("check-icon");
      shareButton.children[0].classList.add("share-icon");
    }, 1000);
  }

  function removeLastDirectoryPartOf(url) {
    var the_arr = url.split("/");
    the_arr.pop();
    return the_arr.join("/");
  }
  //Keep code within this wrapper!
});
