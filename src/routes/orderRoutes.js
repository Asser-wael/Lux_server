import express from "express";

import {
    checkout,
    changeStatus,
    deleteOrder,
    getOrder,
    getOrders,
    getOrdersUser,
    getOrdersByUser,
} from "../controllers/orderController.js";

import {
    adminMiddleware,
    protect,
    optionalAuthMiddleware,
} from "../middlewares/auth.js";

import { upload } from "../utils/multer.js";

const router = express.Router();


// ============================================================
// USER
// ============================================================

// Checkout
router.post(
    "/checkout",
    upload.single("image"),
    protect,
    checkout
);

// Get current user's orders + notifications
router.get(
    "/my-orders",
    protect,
    getOrdersUser
);


// ============================================================
// ADMIN
// ============================================================

// Get all orders
router.get(
    "/orders",
    protect,
    adminMiddleware,
    getOrders
);

// Get specific order
router.get(
    "/orders/:id",
    protect,
    adminMiddleware,
    getOrder
);



// Change order status
router.put(
    "/changeStatus/:id",
    protect,
    adminMiddleware,
    changeStatus
);

// Delete order
router.delete(
    "/deleteOrder/:id",
    protect,
    adminMiddleware,
    deleteOrder
);


export default router;