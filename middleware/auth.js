// server/middleware/auth.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Kiểm tra header tồn tại
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gán user vào req để dùng ở các route sau
    console.log("Decoded user:", decoded);
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token." });
  }
};

export default verifyToken;

