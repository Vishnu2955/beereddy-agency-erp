const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  getMonthlySales,
  getOrderStatus,
  getTopSellingProducts,
} = require("../controllers/dashboardController");

const { verifyToken } = require("../middleware/authMiddleware");

// =====================================
// Dashboard Routes (Authenticated Users)
// =====================================
router.get("/", verifyToken, getDashboardStats);
router.get("/recent-orders", verifyToken, getRecentOrders);
router.get("/low-stock", verifyToken, getLowStockProducts);
router.get("/monthly-sales", verifyToken, getMonthlySales);
router.get("/order-status", verifyToken, getOrderStatus);
router.get("/top-products", verifyToken, getTopSellingProducts);

module.exports = router;