import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Upload folder
const uploadFolder = path.join("./uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- Fetch all images ----------------
router.get("/", (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const images = files.map((file) => ({
      url: `http://localhost:5000/uploads/${file}`,
    }));
    res.json(images);
  });
});

// ---------------- Upload images ----------------
router.post("/upload", upload.array("images", 16), (req, res) => {
  const files = req.files;
  const images = files.map((file) => ({
    url: `http://localhost:5000/uploads/${file.filename}`,
  }));
  res.json(images);
});

// ---------------- Delete image ----------------
router.delete("/", (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });
  const filename = path.basename(imageUrl);
  const filePath = path.join(uploadFolder, filename);

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted successfully" });
  });
});

export default router;
