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
let team = 1;

//--On-Load Wrapper
document.addEventListener("DOMContentLoaded", function () {
  //This wrapper-function ensures, that the websocket connects after the whole document was loaded
  const socket = io.connect();
  connectToRoom(room);

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

  //--Connect to room
  function connectToRoom(room) {
    //Call this apon connecting to the game room
    //Moves the client into a socket.io room, which is later used to broadcast the gamechanges to all clients in this lobby / room
    socket.emit("connect_me", room);
    console.log(socketPrefix + "asking for connection on " + room);
    socket.on("connected_to_room", function () {
      console.log(socketPrefix + "successfully connected to " + room + "!");
    });
  }

  //--Ping to room
  //Send a Ping to everybody in the room
  function pingRoom() {
    team = 2;
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
    console.log(socketPrefix + "Recived Message from server: " + data);
    let ul = document.getElementById("chat");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(data.user + ": " + data.message));
    ul.appendChild(li);
    // ^ Filling the chat with the message that was recieved
  });

  //--Game code

  //--Turn Decition
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

  //--Toggle Ready
  //Toggle between ready and unready
  function toggleReady() {
    if (ready) {
      console.log(socketPrefix + "We aren't Ready!");
      ready = false;
      document.getElementById("ready-button").firstChild.data =
        "Status: Not Ready";
    } else {
      console.log(socketPrefix + "We are Ready!");
      ready = true;
      document.getElementById("ready-button").firstChild.data = "Status: Ready";
    }
    socket.emit("make_ready", { team: team, room: room, status: ready });
    console.log(socketPrefix + "Sending ready-status: " + ready);
  }
  socket.on("make_ready", function (data) {
    if (data.team != team) {
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
      if (ready && opponentReady) {
        start();
      }
    }
  });

  function start() {
    socket.emit("start_game", room);
  }
  socket.on("start", rollForTurn);

  function supposeMove(gamechanges) {
    socket.broadcast.emit("sup_move", { move: gamechanges, room: room });
  }
});
