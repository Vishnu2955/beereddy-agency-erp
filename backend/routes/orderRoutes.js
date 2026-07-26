const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  deleteOrder,
  searchOrders,
} = require("../controllers/orderController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// =====================================================
// Retailer Routes
// =====================================================

// Place Order
router.post("/", verifyToken, createOrder);

// My Orders
router.get("/my-orders", verifyToken, getMyOrders);

// =====================================================
// Admin Routes
// =====================================================

// View All Orders
router.get("/", verifyToken, isAdmin, getAllOrders);

// Search Orders
router.get("/search", verifyToken, isAdmin, searchOrders);

// Get Single Order
router.get("/:id", verifyToken, isAdmin, getSingleOrder);

// Update Order Status
router.put("/:id/status", verifyToken, isAdmin, updateOrderStatus);

// Update Payment Status
router.put(
  "/:id/payment-status",
  verifyToken,
  isAdmin,
  updatePaymentStatus
);

// Cancel Order
router.put("/:id/cancel", verifyToken, isAdmin, cancelOrder);

// Delete Order
router.delete("/:id", verifyToken, isAdmin, deleteOrder);

module.exports = router;