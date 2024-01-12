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
document.getElementById("join-btn").addEventListener("click", function () {
  lobby_link = generateRandomString();
  console.log("lobby link: " + lobby_link);
  location.assign(document.URL + "game/" + lobby_link);
});
