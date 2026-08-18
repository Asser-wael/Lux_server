import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(" ")[1];


    if (!token) {
      console.log("NO TOKEN");
      return res.json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = await User.findById(decoded.id).select("-password");


    next();
  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "No admin access"
      });
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
export const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Token expired",
      });
    }

    req.user = null;
    next();

  }
};

export { protect };