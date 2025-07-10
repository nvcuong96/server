// server/routes/post.js
import express from "express";
import Post from "../models/UserPost.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// POST /api/posts - tạo bài viết
router.post("/", verifyToken, async (req, res) => {
  try {
    const newPost = new Post({
      author: req.user.id,
      content: req.body.content,
      tags: req.body.tags, 
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi tạo bài viết", error: err.message });
  }
});

// GET /api/posts - lấy tất cả bài viết
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

      const simplifiedPosts = posts.map(post => {
        const headingBlock = post.content.find(b => b.type === "heading");
        const imageBlock = post.content.find(b => b.type === "image");
        const textBlock = post.content.find(b => b.type === "text");
        return {
          _id: post._id,
          author: post.author,
          tags: post.tags,
          heading: headingBlock ? headingBlock.value : null,
          image: imageBlock ? imageBlock.value : null,
          text: textBlock ? textBlock.value : null,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
    });

    res.status(200).json(simplifiedPosts);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi lấy bài viết", error: err.message });
  }
});

// GET /api/posts/:id - lấy chi tiết bài viết
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email")
      .populate("comments.user", "username");
    if (!post) return res.status(404).json({ msg: "Không tìm thấy bài viết" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi lấy chi tiết bài viết", error: err.message });
  }
});

export default router;
