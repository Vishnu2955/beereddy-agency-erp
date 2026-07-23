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

const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

// =====================================
// Dashboard Summary
// =====================================
router.get(
  "/",
  verifyToken,
  isAdmin,
  getDashboardStats
);

// =====================================
// Recent Orders
// =====================================
router.get(
  "/recent-orders",
  verifyToken,
  isAdmin,
  getRecentOrders
);

// =====================================
// Low Stock Products
// =====================================
router.get(
  "/low-stock",
  verifyToken,
  isAdmin,
  getLowStockProducts
);

// =====================================
// Monthly Sales
// =====================================
router.get(
  "/monthly-sales",
  verifyToken,
  isAdmin,
  getMonthlySales
);

// =====================================
// Order Status
// =====================================
router.get(
  "/order-status",
  verifyToken,
  isAdmin,
  getOrderStatus
);

// =====================================
// Top Selling Products
// =====================================
router.get(
  "/top-products",
  verifyToken,
  isAdmin,
  getTopSellingProducts
);

module.exports = router;