import express from "express";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getLatestProducts,
} from "../controllers/productController.js";

import {
  adminMiddleware,
  optionalAuthMiddleware,
  protect,
} from "../middlewares/auth.js";

import { upload } from "../utils/multer.js";

const router = express.Router();

// Add
router.post(
  "/addProduct",
  protect,
  adminMiddleware,
  upload.single("image"),
  addProduct
);

// Update
router.put(
  "/updateProduct/:id",
  protect,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

// Delete
router.delete(
  "/deleteProduct/:id",
  protect,
  adminMiddleware,
  deleteProduct
);

// All products
router.get(
  "/products",
  optionalAuthMiddleware,
  getProducts
);

// Latest products
router.get(
  "/products/latest",
  optionalAuthMiddleware,
  getLatestProducts
);

// One product
router.get(
  "/product/:id",
  optionalAuthMiddleware,
  getProduct
);

export default router;