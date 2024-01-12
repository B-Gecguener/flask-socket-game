//--This is the script for the gamepage

//--On-Load Wrapper
document.addEventListener("DOMContentLoaded", function () {
  //This wrapper-function ensures, that the websocket connects after the whole document was loaded
  const socket = io.connect();
  connectToRoom(room);

  //--HTML Elenments and Eventlisteners
  document.getElementById("ping-room").addEventListener("click", pingRoom);

  //--Connect to room
  function connectToRoom(room) {
    //Call this apon connecting to the game room
    //Moves the client into a socket.io room, which is later used to broadcast the gamechanges to all clients in this lobby / room
    socket.emit("connect_me", room);
    console.log("asking for connection on " + room);
    socket.on("connected_to_room", function () {
      console.log("successfully connected to " + room + "!");
    });
  }

  //--Ping to room
  //Send a Ping to everybody in the room
  function pingRoom() {
    socket.emit("ping_to_server", room);
    //Ask server to send ping to your room
  }
  //Listen for ping to your room
  socket.on("ping_to_client", function () {
    console.log("Pinged!");
  });

  //--Chat
  function sendChatMessage(message) {
    //This sends the provided string as a message to the lobbys chat
    socket.emit("chat_message", { message: message, room: room });
  }
  //Listen for chatmessages
  socket.on("chat_message", function (data) {
    //Here append new chatparagraph with content data.message
  });

  //--Game changes
  function supposeMove(gamechanges) {
    socket.broadcast.emit("sup_move", { move: gamechanges, room: room });
  }
});
