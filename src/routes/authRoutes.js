import express from "express";
import { getUser, login, refresh, register } from "../controllers/authController.js";
import { optionalAuthMiddleware, protect } from "../middlewares/auth.js";
import Subscription from "../models/Subscription.js";
const router = express.Router();


router.post("/register", register)

router.post("/login", login)

router.get("/user", optionalAuthMiddleware, getUser)

router.post("/refresh", refresh)

router.post("/logout", protect, async (req, res) => {
  try {
    await Subscription.findOneAndDelete({
      user: req.user.id,
    });
    console.log(process.env.NODE_ENV);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
export default router;
