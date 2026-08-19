import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = {
        id: decoded.id,
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
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