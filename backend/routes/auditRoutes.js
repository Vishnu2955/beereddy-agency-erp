const express = require("express");
const router = express.Router();

const { getAuditLogs, getRecentActivity } = require("../controllers/auditController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);
router.use(isAdmin); // Audit logs are strictly Admin only and immutable

router.get("/", getAuditLogs);
router.get("/activity", getRecentActivity);

module.exports = router;
