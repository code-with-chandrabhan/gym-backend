import express from "express";
import { getTestimonials, addTestimonial, likeTestimonial } from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", addTestimonial);
router.post("/:id/like", likeTestimonial);

export default router;
