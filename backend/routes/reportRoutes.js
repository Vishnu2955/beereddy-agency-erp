const express = require("express");

const router = express.Router();

const {
  getSalesReport,
  getStockReport,
  getRetailerSales,
  getSummary,
} = require("../controllers/reportController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Sales Report
router.get("/sales", verifyToken, isAdmin, getSalesReport);

// Stock Report
router.get("/stock", verifyToken, isAdmin, getStockReport);

// Retailer Purchase Report
router.get("/retailer-sales", verifyToken, isAdmin, getRetailerSales);

// Summary Report
router.get("/summary", verifyToken, isAdmin, getSummary);

module.exports = router;