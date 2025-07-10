import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // null nếu ẩn danh
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // null nếu ẩn danh
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatRoom", chatRoomSchema);