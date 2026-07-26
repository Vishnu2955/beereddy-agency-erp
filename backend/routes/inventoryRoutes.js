const express = require("express");
const router = express.Router();

const {
  getInventory,
  stockIn,
  stockOut,
} = require("../controllers/inventoryController");

// Get inventory history
router.get("/", getInventory);

// Add stock
router.post("/stock-in", stockIn);

// Remove stock
router.post("/stock-out", stockOut);

module.exports = router;