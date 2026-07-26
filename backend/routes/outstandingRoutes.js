const express = require("express");

const router = express.Router();

const {
  getRetailerOutstanding,
  getAllOutstanding,
} = require("../controllers/outstandingController");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

// Get all retailers outstanding
router.get(
  "/",
  verifyToken,
  isAdmin,
  getAllOutstanding
);

// Get one retailer outstanding
router.get(
  "/:id",
  verifyToken,
  isAdmin,
  getRetailerOutstanding
);

module.exports = router;