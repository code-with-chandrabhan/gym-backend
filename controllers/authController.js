import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Register
export const registerUser = async (req, res) => {
  const { name, email, password, city, number } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      city,
      number,
      plans: [],
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Google Login
export const googleLogin = async (req, res) => {
  try {
    const { token, planName, duration, amount } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: null,
        city: "",
        number: "",
        plans: [],
      });
    }

    // Plan add (only if details provided)
    if (planName && duration && amount) {
      const exists = user.plans.some(
        (p) =>
          p.planName === planName &&
          p.duration === Number(duration) &&
          p.amount === Number(amount)
      );

      if (!exists) {
        user.plans.push({
          planName,
          duration: Number(duration),
          amount: Number(amount),
        });
        user.paymentStatus = "Paid";
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      plans: user.plans,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google login failed", error: error.message });
  }
};
