const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {}; // Store active rooms

// Route to create a new room
app.get("/create-room", async (req, res) => {
    const roomId = uuidv4().slice(0, 6); // Generate a short unique ID
    rooms[roomId] = { users: [] }; // Store room details

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(`http://localhost:3000/join/${roomId}`);

    res.json({ roomId, qrCodeUrl });
});

// WebSocket for real-time updates
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) return socket.emit("error", "Room not found");
        
        socket.join(roomId);
        rooms[roomId].users.push(socket.id);
        console.log(`User ${socket.id} joined room ${roomId}`);
        
        io.to(roomId).emit("user-joined", { userId: socket.id, roomId });
    });

    socket.on("playback-update", (data) => {
        io.to(data.roomId).emit("sync-playback", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3001, () => console.log("Server running on port 3001"));
