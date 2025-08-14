import ForumPost from "../models/ForumPost.js";
import express from "express";
import verifyToken from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

// POST /api/forum - tạo bài viết diễn đàn
router.post("/", verifyToken, async (req, res) => {
  try {
    const { heading, content, isAnonymous, tags, image } = req.body;

    if (!heading || !content) return res.status(400).json({ msg: "Thiếu tiêu đề hoặc nội dung" });
        const newForumPost = new ForumPost({
        author: req.user.id,
        isAnonymous: !!isAnonymous,
        heading,
        content, 
        image,
        tags: tags || [],
        });
        const savedPost = await newForumPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ msg: "Lỗi khi tạo bài viết", error: err.message });
    }
});

router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.user? req.user.id : null; 
    const posts = await ForumPost.find().sort({ createdAt: -1 }).populate("author", "username");
    
    const result = posts.map(post => {
        const obj = post.toObject();
        if (obj.isAnonymous) {
            obj.author = {username: "Người dùng ẩn danh"};
        }
        obj.likes.isLiked = userId && obj.likes.likedBy.some(id => 
          id.toString() === userId
        );
        obj.commentCount = obj.comments.length;
        return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi lấy bài viết", error: err.message });
  }
});

router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Bài viết không tồn tại" });
    
    
    if (!post.likes) {
      post.likes = { likeCount: 0, likedBy: [] };
    }
    if (!post.likes.likedBy) {
      post.likes.likedBy = [];
    }
    const userId = req.user.id;
    const isLiked = post.likes.likedBy.some(id => 
          id.toString() === userId
    );

    if (isLiked){
      post.likes.likeCount -= 1;
      post.likes.likedBy = post.likes.likedBy.filter(id => id.toString() !== userId);
    } else {
      post.likes.likeCount += 1;
      post.likes.likedBy.push(userId);
    }
    await post.save();
    res.json({ msg: "Thích bài viết thành công", likeCount: post.likes.likeCount, isLiked: !isLiked });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi thích bài viết", error: err.message });
  }
});

router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const text  = req.body.content;
    if (!text) return res.status(400).json({ msg: "Nội dung bình luận không được để trống" });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Bài viết không tồn tại" });

    post.comments.push({ user: req.user.id, text });
    await post.save();

    const updatedPost = await ForumPost.findById(req.params.id).populate("comments.user", "username");
    res.status(201).json({ msg: "Bình luận thành công", comments: updatedPost.comments });
  } catch (err) {
    res.status(500).json({ msg: "Lỗi khi bình luận", error: err.message });
  }
});

export default router;
