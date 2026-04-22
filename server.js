const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Serve frontend files
app.use(express.static("public"));

// Store connected devices
let devices = [];

io.on("connection", (socket) => {
  console.log("⚡ Device connected:", socket.id);

  // 📡 Receive device info
  socket.on("device-info", (data) => {
    const device = {
      id: socket.id,
      device: data.device || "Unknown",
      screen: data.screen || "Unknown",
      lat: data.lat || null,
      lng: data.lng || null,
      time: new Date().toLocaleTimeString()
    };

    // Add or update device
    const existingIndex = devices.findIndex(d => d.id === socket.id);
    if (existingIndex !== -1) {
      devices[existingIndex] = device;
    } else {
      devices.push(device);
    }

    // Broadcast updated list
    io.emit("update-devices", devices);
  });

  // 📷 Receive camera frames
  socket.on("camera-frame", (img) => {
    io.emit("camera-frame", img);
  });

  // ❌ Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Device disconnected:", socket.id);

    devices = devices.filter(d => d.id !== socket.id);

    io.emit("update-devices", devices);
  });
});

// Default route (optional)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Port (Render compatible)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});