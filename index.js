// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/adminPost.js";
import chatRoutes from "./routes/chat.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js"; // Import Message model
import forumPostRoutes from "./routes/forumPost.js"; // Import forum post routes


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Forum API is running.");
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  // Tạo HTTP server riêng
  const server = http.createServer(app);
  // Khởi tạo Socket.io
  const io = new Server(server, { cors: { origin: "*" } });

  // Xử lý socket chat
  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ roomId, sender, content }) => {
      const message = await Message.create({ room: roomId, sender, content });
      io.to(roomId).emit("receiveMessage", message);
    });
  });

  server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/forum", forumPostRoutes);
