import express from "express";
import {
  getTrust,
  addTrust,
  updateTrust,
  deleteTrust,
} from "../controllers/trustController.js";
import upload from "../middlewares/upload.js";
import { adminMiddleware, protect } from "../middlewares/auth.js";

const router = express.Router();


router.get("/", getTrust);
router.post("/", protect, adminMiddleware, upload.single("image"), addTrust);
router.put("/:id", protect, adminMiddleware, upload.single("image"), updateTrust);
router.delete("/:id", protect, adminMiddleware, deleteTrust);

export default router;