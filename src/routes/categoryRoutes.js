import express from "express";
import {
    addCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getCategory,
} from "../controllers/categoryController.js";
import { upload } from "../utils/multer.js";
import { adminMiddleware, protect } from "../middlewares/auth.js";

const router = express.Router();

router.post(
    "/addCategory",
    upload.single("image"),
    protect,
    adminMiddleware,
    addCategory
);
router.delete(
    "/deleteCategory",
    protect,
    adminMiddleware,
    deleteCategory
);
router.put(
    "/updateCategory/:id",
    upload.single("image"),
    protect,
    adminMiddleware,
    updateCategory
);
router.get(
    "/categories",
    getCategories
);

router.get(
    "/category/:id",
    getCategory
);


export default router;