const express = require("express");
const router = express.Router();

const {
  getSystemStatus,
  getMaintenanceState,
  toggleMaintenanceState,
} = require("../controllers/systemController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Public Maintenance Status Check
router.get("/maintenance", getMaintenanceState);

// Protected Admin System Infrastructure & Maintenance Routes
router.get("/status", verifyToken, isAdmin, getSystemStatus);
router.put("/maintenance", verifyToken, isAdmin, toggleMaintenanceState);

module.exports = router;
