// server/models/User.js
import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:{ type: String, enum: ["user", "admin"], default: "user" }, // Thêm trường role
}, { timestamps: true });

export default mongoose.model("User", userSchema);
