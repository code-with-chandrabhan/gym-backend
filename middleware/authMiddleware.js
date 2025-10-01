import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token in middleware:", token); // Debug

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No token provided in headers");
    res.status(401).json({ message: "No token provided" });
  }
};

export default protect;
