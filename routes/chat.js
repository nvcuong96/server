// routes/chat.js
import express from "express";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Tạo phòng chat mới (ẩn danh)
router.post("/room", verifyToken, async (req, res) => {
  let room = await ChatRoom.findOne({ user: req.user.id });
  if (!room) {
    room = await ChatRoom.create({ user: req.user.id });
  }
  res.json({ roomId: room._id });
});
// Tạo phòng chat mới (ẩn danh) nếu chưa có, hoặc trả về phòng hiện tại
router.post("/room-ano", async (req, res) => {
  const room = await ChatRoom.create({});
  res.json({ roomId: room._id });
});

// Lấy tin nhắn của phòng
router.get("/room/:roomId/messages", async (req, res) => {
  if (!req.params.roomId) {
    return res.status(400).json({ msg: "Thiếu roomId" });
  }
  try {
    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi lấy tin nhắn", error: err.message });
  }
});

// Lấy danh sách phòng chat cho admin
router.get("/rooms", verifyToken, async (req, res) => {
  // Chỉ cho phép admin
  console.log(req.user.role);
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden" });
  const rooms = await ChatRoom.find({
    $or: [
      { admin: null },
      { admin: req.user.id }
    ]
  }).populate("user", "username email").populate("admin", "username");
  res.json(rooms);
});

// Admin nhận xử lý một phòng chat
router.post("/room/:roomId/accept", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden" });
  const room = await ChatRoom.findByIdAndUpdate(
    req.params.roomId,
    { admin: req.user.id },
    { new: true }
  );
  res.json(room);
});

// Xóa phòng chat (chỉ cho admin đã nhận phòng)
router.delete("/room/:roomId", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden" });
  const room = await ChatRoom.findById(req.params.roomId);
  if (!room) return res.status(404).json({ msg: "Not found" });
  if (!room.admin || room.admin.toString() !== req.user.id)
    return res.status(403).json({ msg: "Chỉ admin đã nhận phòng mới được xóa" });
  await Message.deleteMany({ room: room._id });
  await ChatRoom.findByIdAndDelete(room._id);
  res.json({ msg: "Đã xóa phòng chat" });
});

export default router;