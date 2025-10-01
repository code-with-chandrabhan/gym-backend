// backend/models/Join.js
import mongoose from "mongoose";

const joinSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Join", joinSchema);
