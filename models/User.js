import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  planName: String,
  duration: Number,
  amount: Number,
  purchasedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    city: String,
    number: String,
    avatar: String,
    plans: [planSchema],
    paymentStatus: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
