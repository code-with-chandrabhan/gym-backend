import Testimonial from "../models/Testimonial.js";

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Failed to load testimonials" });
  }
};

export const addTestimonial = async (req, res) => {
  try {
    const { name, comment, rating } = req.body;
    const newTestimonial = new Testimonial({ name, comment, rating });
    const saved = await newTestimonial.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to add testimonial" });
  }
};

export const likeTestimonial = async (req, res) => {
  try {
    const id = req.params.id;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).json({ message: "Not found" });

    testimonial.likes += 1;
    await testimonial.save();
    res.json({ likes: testimonial.likes });
  } catch (error) {
    res.status(500).json({ message: "Failed to like testimonial" });
  }
};
