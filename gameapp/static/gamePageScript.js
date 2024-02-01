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
let teamMembers = {};
let myName = name;
let tiles = [];

//--On-Load Wrapper
document.addEventListener("DOMContentLoaded", function () {
  //This wrapper-function ensures, that the websocket connects after the whole document was loaded
  const socket = io.connect();
  connectToRoom(room);

  //--Stats
  //These are the html elements and their respective classes
  //that should be changed depending on the game state:

  let statsSelf = document.getElementById("stats-self");
  let statsOpponent = document.getElementById("stats-opponent");

  //"turn-indicator" depending on which turn it is
  let labelSelfElem = statsSelf.children[0];
  let labelOpponentElem = statsOpponent.children[0];

  //"red" "green" depending on which team it is
  let nameSelfElem = statsSelf.children[1];
  let nameOpponentElem = statsOpponent.children[1];

  //depending on how many wins a player has
  let scoreSelfElem = statsSelf.children[2];
  let scoreOpponentElem = statsOpponent.children[2];

  //--HTML Elenments and Eventlisteners
  document.getElementById("ping-room").addEventListener("click", pingRoom);
  document
    .getElementById("message")
    .addEventListener("keyup", function (event) {
      if (event.key == "Enter") {
        sendChatMessage();
      }
    });
  document
    .getElementById("ready-button")
    .addEventListener("click", toggleReady);
  document.getElementById("team-toggle").addEventListener("click", toggleTeam);

  //--Connect to room
  function connectToRoom(room) {
    //Call this apon connecting to the game room
    //Moves the client into a socket.io room, which is later used to broadcast the gamechanges to all clients in this lobby / room
    socket.emit("connect_me", { room: room, name: myName });
    console.log(socketPrefix + "asking for connection on " + room);
    socket.on("connected_to_room", function () {
      console.log(socketPrefix + "successfully connected to " + room + "!");
    });
  }

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
    if (!data) {
      console.log(socketPrefix + "your are alone");
    } else {
      var newName = data.name + "";
      names[data["user-sid"]] = newName;
      if (socket.id != data["user-sid"]) {
        nameOpponentElem.firstChild.data = newName;
      } else {
        console.log(socketPrefix + "own name detected");
      }

      console.log(socketPrefix + "recived name: " + names[data["user-sid"]]);
    }
    //insert new user and name or update users name
  });

  //--Ping to room
  //Send a Ping to everybody in the room
  function pingRoom() {
    socket.emit("ping_to_server", room);
    // ^ Ask server to send ping to your room
  }
  //Listen for ping to your room
  socket.on("ping_to_client", function () {
    console.log(socketPrefix + "Pinged!");
  });

  //--Chat
  function sendChatMessage() {
    //This sends the provided string as a message to the lobbys chat
    let message = document.getElementById("message").value;
    // ^ get the message string out of the input line
    socket.emit("chat_message", { message: message, room: room });
    // ^ send message to the room, the socket is in
    document.getElementById("message").value = "";
    console.log(socketPrefix + "Message send to server: " + message);
  }
  //Listen for chatmessages
  socket.on("chat_message", function (data) {
    console.log(socketPrefix + "Recived Message from server: " + data.message);
    var parentElem = document.getElementById("messages");
    var msgElem = document.createElement("div");
    var nameElem = document.createElement("p");
    var grdBottom = document.getElementById("grd-bottom");
    nameElem.appendChild(document.createTextNode(names[data.user] + ": "));

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
      console.log("offsetHeight: " + oH);
      console.log("scrollTop: " + sT);
      console.log("scrollHeight: " + sH);
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
  function toggleReady() {
    if (ready) {
      socket.emit("make_ready", { team: team, room: room, status: "false" });
      console.log(socketPrefix + "Sending ready-status: false");
    } else {
      socket.emit("make_ready", { team: team, room: room, status: "true" });
      console.log(socketPrefix + "Sending ready-status: true");
    }
  }
  socket.on("make_ready", function (data) {
    if (names[data.userSid] != myName) {
      console.log(
        socketPrefix + "Opponent Teams ready-status is " + data.status
      );
      opponentReady = data.status;
      if (opponentReady) {
        document.getElementById("opponent-ready-status").innerText =
          "Opponent: Ready";
      } else {
        document.getElementById("opponent-ready-status").innerText =
          "Opponent: Not Ready";
      }
    }
    if (names[data.userSid] == myName) {
      if (data.status) {
        console.log(socketPrefix + "We are Ready!");
        ready = false;
        document.getElementById("ready-button").firstChild.data =
          "Status: Ready";
      } else {
        console.log(socketPrefix + "We aren't Ready!");
        ready = false;
        document.getElementById("ready-button").firstChild.data =
          "Status: Not Ready";
      }
    }
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
  //Keep code within this wrapper!
});
