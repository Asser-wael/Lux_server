import express from "express";
import {
  getDashboardCards,
  getRevenueChart,
  getOrdersChart,
  getLatestOrders,
  getLowStockProducts,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/cards", getDashboardCards);
router.get("/revenue-chart", getRevenueChart);
router.get("/orders-chart", getOrdersChart);  
router.get("/latest-orders", getLatestOrders);
router.get("/low-stock", getLowStockProducts);

export default router;