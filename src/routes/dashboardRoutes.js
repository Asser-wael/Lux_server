import express from "express";
import {
  getDashboardCards,
  getRevenueChart,
  getOrdersChart,
  getLatestOrders,
  getLowStockProducts,
} from "../controllers/dashboardController.js";
import { adminMiddleware, protect } from "../middlewares/auth.js";

const router = express.Router();


router.get("/cards", protect, adminMiddleware, getDashboardCards);
router.get("/revenue-chart", protect, adminMiddleware, getRevenueChart);
router.get("/orders-chart", protect, adminMiddleware, getOrdersChart);  
router.get("/latest-orders", protect, adminMiddleware, getLatestOrders);
router.get("/low-stock", protect, adminMiddleware, getLowStockProducts);
export default router;