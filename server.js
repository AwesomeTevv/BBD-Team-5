const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = generateRoomCode();
    socket.join(roomId);
    socket.emit("roomCreated", roomId);
    console.log("Room created:", roomId);
  });

  socket.on("joinGame", (roomId, playerName) => {
    socket.join(roomId);
    io.to(roomId).emit("playerJoined", playerName);
    console.log(`${playerName} joined room: ${roomId}`);
  });

  socket.on("startGame", (roomId) => {
    io.to(roomId).emit("gameStarted");
  });

  socket.on("gyroscopeData", (roomId, data) => {
    io.to(roomId).emit("gyroscopeData", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
