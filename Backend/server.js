const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let channels = { general: [] };

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChannel", (channel) => {
    if (!channels[channel]) channels[channel] = [];
    socket.join(channel);
    io.to(channel).emit("userJoined", `${socket.id} joined ${channel}`);
  });

  socket.on("sendMessage", ({ channel, message, user }) => {
    const msgData = { user, message, time: new Date().toISOString() };
    io.to(channel).emit("newMessage", msgData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
