const express = require("express");

const router = express.Router();

const {
  getSalesReport,
  getStockReport,
  getRetailerSales,
  getSummary,
} = require("../controllers/reportController");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

// Summary
router.get(
  "/",
  verifyToken,
  isAdmin,
  getSummary
);

// Sales Report
router.get(
  "/sales",
  verifyToken,
  isAdmin,
  getSalesReport
);

// Stock Report
router.get(
  "/stock",
  verifyToken,
  isAdmin,
  getStockReport
);

// Retailer Report
router.get(
  "/retailers",
  verifyToken,
  isAdmin,
  getRetailerSales
);

module.exports = router;