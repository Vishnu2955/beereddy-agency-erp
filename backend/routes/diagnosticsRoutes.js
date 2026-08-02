const express = require("express");
const router = express.Router();

const {
  runSelfCheck,
  getBugs,
  resolveBug,
} = require("../controllers/diagnosticsController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Admin Diagnostics & Self-Check Endpoints
router.get("/run-check", verifyToken, isAdmin, runSelfCheck);
router.get("/bugs", verifyToken, isAdmin, getBugs);
router.put("/bugs/:id/resolve", verifyToken, isAdmin, resolveBug);

module.exports = router;
