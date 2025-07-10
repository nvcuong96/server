import mongoose from "mongoose";

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["heading", "section-title", "text", "image", "video"],
    required: true
  },
  value: { type: String, required: true }
}, { _id: false });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: [contentBlockSchema],  // Mảng các khối nội dung
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("UserPost", postSchema);
