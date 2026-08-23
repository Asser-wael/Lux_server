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
    protect,
    adminMiddleware,
    upload.single("image"),
    addCategory
);

router.put(
    "/updateCategory/:id",
    protect,
    adminMiddleware,
    upload.single("image"),
    updateCategory
);
router.delete(
    "/deleteCategory",
    protect,
    adminMiddleware,
    deleteCategory
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