import express from "express";
import {
  getTrust,
  addTrust,
  updateTrust,
  deleteTrust,
} from "../controllers/trustController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getTrust);
router.post("/", upload.single("image"), addTrust);
router.put("/:id", upload.single("image"), updateTrust);
router.delete("/:id", deleteTrust);

export default router;