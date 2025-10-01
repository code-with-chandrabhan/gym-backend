import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, default: 5 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Default export होना चाहिए
const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;
