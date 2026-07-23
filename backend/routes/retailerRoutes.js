const express = require("express");
const router = express.Router();

// Controllers
const {
  addRetailer,
  getAllRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
} = require("../controllers/retailerController");

// Middleware
const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

// ======================================================
// Retailer Routes (Admin Only)
// ======================================================

// Add Retailer
router.post("/add", verifyToken, isAdmin, addRetailer);

// Get All Retailers
router.get("/", verifyToken, isAdmin, getAllRetailers);

// Get Single Retailer
router.get("/:id", verifyToken, isAdmin, getRetailerById);

// Update Retailer
router.put("/:id", verifyToken, isAdmin, updateRetailer);

// Delete Retailer
router.delete("/:id", verifyToken, isAdmin, deleteRetailer);

module.exports = router;