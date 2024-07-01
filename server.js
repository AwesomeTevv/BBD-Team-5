const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = new Map();

io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, { host: socket.id, players: [] });
    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
  });

  socket.on("joinRoom", ({ name, roomCode }) => {
    const room = rooms.get(roomCode);
    if (room) {
      room.players.push({ id: socket.id, name });
      socket.join(roomCode);
      socket.to(roomCode).emit("playerJoined", { name });
      socket.emit("joinedRoom", { roomCode, players: room.players });
    } else {
      socket.emit("error", "Room not found");
    }
  });

  socket.on("disconnect", () => {
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        socket.to(roomCode).emit("playerLeft", { name: player.name });
      }
    });
  });
});

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
