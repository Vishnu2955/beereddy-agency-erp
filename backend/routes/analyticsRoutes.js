const express = require("express");
const router = express.Router();

const {
  getAnalyticsDashboard,
  getSalesAnalytics,
  getInventoryAnalytics,
  getFinanceAnalytics,
} = require("../controllers/analyticsController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);
router.use(isAdmin);

router.get("/dashboard", getAnalyticsDashboard);
router.get("/sales", getSalesAnalytics);
router.get("/inventory", getInventoryAnalytics);
router.get("/finance", getFinanceAnalytics);

module.exports = router;
