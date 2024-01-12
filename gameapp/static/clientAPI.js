document.addEventListener("DOMContentLoaded", function () {
  const socket = io.connect();
  connectToRoom(room);

  document.getElementById("ping-room").addEventListener("click", pingRoom);

  function connectToRoom(room) {
    //Call this apon connecting to the game room
    //Moves the client into a socket.io room, which is later used to broadcast the gamechanges to all clients in this lobby / room
    socket.emit("connect_me", room);
    console.log("asking for connection on " + room);
    socket.on("connected_to_room", function () {
      console.log("successfully connected to " + room + "!");
    });
  }

  function sendChatMessage(message) {
    //This sends the provided string as a message to the lobbys chat
    socket.broadcast.emit("chat_message", { message: message, room: room });
  }

  function supposeMove(gamechanges) {
    socket.broadcast.emit("sup_move", { move: gamechanges, room: room });
  }

  socket.on("ping_to_client", function () {
    console.log("Pined!");
  });

  function pingRoom() {
    socket.emit("ping_to_server", room);
  }
});
