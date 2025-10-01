// backend/routes/join.js
import express from "express";
import Join from "../models/Join.js";

const router = express.Router();

// POST /api/join
router.post("/", async (req, res) => {
  try {
    const { name, email, contact } = req.body;

    if (!name || !email || !contact) {
      return res.status(400).json({ message: "name, email and contact are required" });
    }

    const newJoin = new Join({ name, email, contact });
    await newJoin.save();

    return res.status(201).json({ message: "Saved successfully", data: newJoin });
  } catch (err) {
    console.error("Join API Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/join (all saved entries)
router.get("/", async (req, res) => {
  try {
    const data = await Join.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
