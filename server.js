import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/payment.js";
import imageRoutes from "./routes/imageRoutes.js";
import joinRoutes from "./routes/join.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import planRoutes from "./routes/plan.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// Debug logging for /api/users routes
app.use("/api/users", (req, res, next) => {
  console.log("[server] Incoming /api/users request:", req.method, req.originalUrl);
  next();
}, userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/join", joinRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/buy-plan", planRoutes);
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
