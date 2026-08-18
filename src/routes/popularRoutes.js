import express from "express";
import {
    getPopularProducts,
    addPopularProduct,
    deletePopularProduct,
} from "../controllers/popularController.js";

import { protect, adminMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get(
    "/",
    getPopularProducts
);

router.post(
    "/",
    protect,
    adminMiddleware,
    addPopularProduct
);

router.delete(
    "/:id",
    protect,
    adminMiddleware,
    deletePopularProduct
);

export default router;