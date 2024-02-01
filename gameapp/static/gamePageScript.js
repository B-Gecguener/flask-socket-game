//--This is the script for the gamepage
let socketPrefix = "[socket]: ";
//--Global Game Variables
//Ready Boolean
let ready = false;
let opponentReady = false;
//TurnBoolean, if true, its clients turn
let turn = null;

//Global save of rolls, to decide for turn
let ourRoll = null;
let otherRoll = null;

//TeamID of client
let team = "X";

//Name List
let names = {};
let myName = name;
let tiles = [];
let player = null;
let opponent = null;
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
    socket.emit("connect_me", { room: room, name: myName });
    console.log(socketPrefix + "asking for connection on " + room);
  }

  socket.on("connected_to_room", function () {
    console.log(socketPrefix + "successfully connected to " + room + "!");
  });

  socket.on("lobby_full", function () {
    console.log(socketPrefix + "room is full");
  });

  //--Names
  socket.on("get_name", function (data) {
    console.log(socketPrefix + "our name was requested!");
    socket.emit("my_name", {
      name: myName,
      for: data.for,
    });
    //answer server with my name
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
    }
    displayNames();
  });
  function displayNames() {
    // let namePlayerNode = document.createTextNode(player.name);
    namePlayerElem.innerText = player.name;
    if (opponent != null) {
      statsOpponentElem.classList.remove("hidden");
      // let nameOpponentNode = document.createTextNode(opponent.name);
      // nameOpponentElem.appendChild(nameOpponentNode);
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

    // msgElem.appendChild(
    //   document.createTextNode(userName + ": " + data.message)
    // );
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

  //--Toggle Ready
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

  socket.on("start_game", function (data) {
    console.log("game started");
    gameTextElem.classList.add("hidden");
    readyButtonElem.classList.add("hidden");
    gameBoardElem.classList.remove("hidden");
  });

  //--Turn Decision
  //These (chaotic hell of) functions decides who begins
  function rollForTurn() {
    var roll = Math.random();
    console.log(socketPrefix + "Rolling for turn. Roll: " + roll);
    ourRoll = roll;
    socket.emit("roll_for_turn", { roll: roll, team: team, room: room });
    // ^ send roll, teamID and room to the server, to send your teams roll to everybody else in your room
  }
  socket.on("roll_for_turn", function (data) {
    if (data.team != team) {
      otherRoll = data.roll;
      console.log(socketPrefix + "Roll recieved!");
      console.log(socketPrefix + "Opponent Roll: " + data.roll);
    }
    // ^ save your roll, and other teams roll
    if (ourRoll != null && otherRoll != null) {
      if (ourRoll > otherRoll) {
        turn = true;
        console.log(socketPrefix + "We start.");
      } else if (ourRoll < otherRoll) {
        turn = false;
        console.log(socketPrefix + "We are second.");
      } else {
        console.log(socketPrefix + "Reroll needed.");
        turn = null;
        rerollTurn();
      }
      ourRoll = null;
      otherRoll = null;
    }
    // ^ if both rolls are saved, decide which one is bigger, its that teams turn
  });

  //Reroll Turn, (if both rolls are the same or something went wrong)
  function rerollTurn() {
    rollForTurn();
  }

  function start() {
    socket.emit("start_game", room);
  }

  socket.on("start", rollForTurn);

  function supposeMove(gamechanges) {
    socket.broadcast.emit("sup_move", { move: gamechanges, room: room });
  }

  //--Choose Team
  //Toggles the Team and informs other Clients
  function toggleTeam() {
    if (team == "X") {
      team = "O";
      console.log(socketPrefix + "Switching to Team O");
      socket.emit("switch_team", { team: "O", room: room });
      document.getElementById("team-toggle").firstChild.data = "O Team";
    } else {
      team = "X";
      console.log(socketPrefix + "Switching to team X");
      socket.emit("switch_team", { team: "X", room: room });
      document.getElementById("team-toggle").firstChild.data = "X Team";
    }
  }
  socket.on("switch_team", function (data) {
    console.log(
      socketPrefix +
        "'" +
        names[data.user] +
        "' is now in Team '" +
        data.team +
        "'"
    );
    teamMembers[data.user] = data.team;
  });

  // Makes tiles on the gameboard clickable
  tiles = document.getElementsByClassName("tile");

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener("click", tileClicked);
  }

  function tileClicked(e) {
    cl = e.target.classList;
    if (cl.contains("empty")) {
      if (team == "X") {
        cl.remove("empty");
        cl.add("cross");
      }
      if (team == "O") {
        cl.remove("empty");
        cl.add("circle");
      }
    }
  }
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
