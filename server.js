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

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL_DEV, // Dev frontend URL
  process.env.FRONTEND_URL_PROD // Prod frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/join", joinRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/buy-plan", planRoutes);

app.use("/uploads", express.static("uploads"));

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
