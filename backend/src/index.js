import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import documentRoutes from "./routes/document.route.js";
import contactRoutes from "./routes/contact.route.js";
import { app, server } from "./lib/socket.js";

// Load environment variables from .env file
dotenv.config();

// const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://connect-now-frontend-citi.onrender.com", // Replace with your actual Render frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", documentRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT;

// console.log(`Server is running on ${PORT}`);
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectDB();
});
