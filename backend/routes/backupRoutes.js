const express = require("express");
const router = express.Router();

const {
  createBackup,
  getBackups,
  restoreBackup,
} = require("../controllers/backupController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Admin Backup & Restore Endpoints
router.get("/list", verifyToken, isAdmin, getBackups);
router.post("/create", verifyToken, isAdmin, createBackup);
router.post("/restore", verifyToken, isAdmin, restoreBackup);

module.exports = router;
