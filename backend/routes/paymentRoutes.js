const express = require("express");

const router = express.Router();
const upload = require("../middleware/paymentUpload");

const {
  createPayment,
  getAllPayments,
  getRetailerPayments,
  updatePaymentStatus,
  deletePayment,
} = require("../controllers/paymentController");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

// =====================================
// Create Payment Request
// =====================================
router.post(
  "/",
  verifyToken,
  upload.single("screenshot"),
  createPayment
);

// =====================================
// Get Payments
// =====================================
router.get(
  "/",
  verifyToken,
  getAllPayments
);

// =====================================
// Get Retailer Payments
// =====================================
router.get(
  "/retailer/:id",
  verifyToken,
  getRetailerPayments
);

// =====================================
// Approve / Reject Payment
// =====================================
router.put(
  "/:id/status",
  verifyToken,
  isAdmin,
  updatePaymentStatus
);

// =====================================
// Delete Payment
// =====================================
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  deletePayment
);

module.exports = router;