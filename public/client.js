const socket = io();

const mainMenu = document.getElementById("main-menu");
const joinForm = document.getElementById("join-form");
const lobby = document.getElementById("lobby");
const game = document.getElementById("game");
const createRoomBtn = document.getElementById("create-room");
const joinRoomBtn = document.getElementById("join-room");
const submitJoinBtn = document.getElementById("submit-join");
const startGameBtn = document.getElementById("start-game");
const playerNameInput = document.getElementById("player-name");
const roomCodeInput = document.getElementById("room-code");
const roomCodeDisplay = document.getElementById("room-code-display");
const playerList = document.getElementById("player-list");

let currentRoom = null;
let isHost = false;

createRoomBtn.addEventListener("click", () => {
  socket.emit("createRoom");
});

joinRoomBtn.addEventListener("click", () => {
  mainMenu.style.display = "none";
  joinForm.style.display = "block";
});

submitJoinBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  const roomCode = roomCodeInput.value.trim();
  if (name && roomCode) {
    socket.emit("joinRoom", { name, roomCode });
  }
});

startGameBtn.addEventListener("click", () => {
  if (currentRoom) {
    socket.emit("startGame", currentRoom);
  }
});

socket.on("roomCreated", (roomCode) => {
  currentRoom = roomCode;
  isHost = true;
  mainMenu.style.display = "none";
  lobby.style.display = "block";
  roomCodeDisplay.textContent = roomCode;
  startGameBtn.style.display = "block";
});

socket.on("joinedRoom", ({ roomCode, isHost: hostStatus }) => {
  currentRoom = roomCode;
  isHost = hostStatus;
  joinForm.style.display = "none";
  lobby.style.display = "block";
  roomCodeDisplay.textContent = roomCode;
  if (isHost) {
    startGameBtn.style.display = "block";
  }
});

socket.on("playerJoined", ({ name }) => {
  const li = document.createElement("li");
  li.textContent = name;
  playerList.appendChild(li);
});

socket.on("updatePlayerList", (players) => {
  updatePlayerList(players);
});

socket.on("playerLeft", ({ name }) => {
  const players = Array.from(playerList.children);
  const playerToRemove = players.find((p) => p.textContent === name);
  if (playerToRemove) {
    playerList.removeChild(playerToRemove);
  }
});

socket.on("gameStarted", () => {
  lobby.style.display = "none";
  game.style.display = "block";
});

socket.on("error", (message) => {
  alert(message);
});

function updatePlayerList(players) {
  playerList.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player.name;
    playerList.appendChild(li);
  });
}
