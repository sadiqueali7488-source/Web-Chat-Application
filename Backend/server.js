const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
app.use(express.json);
app.use(cors);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("new user has connected :", socket.id);

  socket.on("chatmessage", (msg) => {
    console.log("message from client :", msg);
    io.emit("message", msg);

    socket.on("disconnected", () => {
      console.log("user disconnected :", socket.id);
    });
  });
});

server.listen(3000, () => {
  console.log("server started at 3000 port");
});
