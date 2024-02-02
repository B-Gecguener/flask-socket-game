//This is the script for the landingpage

//By clicking on the "Create Lobby" Button, create random String and redirect to game url
// document.getElementById("join-btn").addEventListener("click", function () {
//   lobby_link = generateRandomString();
//   console.log("lobby link: " + lobby_link);
//   location.assign(document.URL + "game/" + lobby_link);
// });
document.addEventListener("DOMContentLoaded", function () {
  if (room != "") {
    let roomInput = document.getElementById("room-input");
    roomInput.value = room;
    roomInput.readOnly = true;
  }
  if (username != "") {
    let nameInput = document.getElementById("name-input");
    nameInput.value = username;
    //nameInput.readOnly = true;
  }

  //This creates a Sting out of ascii Chars and Nubers
  function generateRandomString() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }
});
