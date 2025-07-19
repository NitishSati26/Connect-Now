import { Server } from "socket.io";
import http from "http";
import express from "express";
import { log } from "console";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // your frontend
  },
});

// Online users map
const userSocketMap = {}; // { userId: socketId }

// Utility to get a specific user's socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ==========================
  // 🟢 JOIN GROUP ROOMS
  // ==========================
  socket.on("joinGroups", (userId) => {
    // Import Group model to get user's groups
    import("../models/group.model.js").then(({ default: Group }) => {
      Group.find({ members: userId })
        .then((groups) => {
          groups.forEach((group) => {
            socket.join(group._id.toString()); // join each group room
          });
          console.log(`User ${userId} joined ${groups.length} groups`);
        })
        .catch((error) => {
          console.error("Error joining groups:", error);
        });
    });
  });

  // ==========================
  // 🔴 Disconnect
  // ==========================
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
