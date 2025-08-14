import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isAnonymous: { type: Boolean, default: false },
  heading: { type: String, required: true },
  content: { type: String, required: true }, // Lưu HTML
  image: { type: String }, // link ảnh nếu có
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  likes: { 
    likeCount: { type: Number, default: 0 }, 
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.model("ForumPost", forumPostSchema);