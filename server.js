const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.static("public"));

let devices = [];

io.on("connection", (socket) => {
  console.log("⚡ New device connected");

  socket.on("device-info", (data) => {
    const device = {
      id: socket.id,
      ...data,
      time: new Date().toLocaleTimeString()
    };

    devices.push(device);
    io.emit("update-devices", devices);
  });

  socket.on("disconnect", () => {
    devices = devices.filter(d => d.id !== socket.id);
    io.emit("update-devices", devices);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});