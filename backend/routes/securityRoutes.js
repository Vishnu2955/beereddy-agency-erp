const express = require("express");
const router = express.Router();

const {
  getSecurityStats,
  getSecuritySettings,
  updateSecuritySettings,
} = require("../controllers/securityController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Admin Security Dashboard Metrics & Settings
router.get("/stats", verifyToken, isAdmin, getSecurityStats);
router.get("/settings", verifyToken, isAdmin, getSecuritySettings);
router.put("/settings", verifyToken, isAdmin, updateSecuritySettings);

module.exports = router;
