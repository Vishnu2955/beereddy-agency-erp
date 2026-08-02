const express = require("express");
const router = express.Router();

const {
  getInventoryList,
  getInventoryDashboard,
  getStockHistory,
  getLowStockItems,
  getOutOfStockItems,
  purchaseStockEntry,
  adjustStock,
  recordDamage,
  requestReturn,
  updateReturnStatus,
  transferStock,
  getWarehouses,
  createWarehouse,
} = require("../controllers/inventoryController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// All inventory routes require JWT authentication
router.use(verifyToken);

// ===========================================
// GET Endpoints
// ===========================================
router.get("/", getInventoryList);
router.get("/dashboard", getInventoryDashboard);
router.get("/history", getStockHistory);
router.get("/low-stock", getLowStockItems);
router.get("/out-of-stock", getOutOfStockItems);
router.get("/warehouses", getWarehouses);

// ===========================================
// POST & PUT Endpoints (Admin & Retailer)
// ===========================================
router.post("/purchase", isAdmin, purchaseStockEntry);
router.post("/adjust", isAdmin, adjustStock);
router.post("/damage", isAdmin, recordDamage);
router.post("/return", requestReturn);
router.put("/return/:id/status", isAdmin, updateReturnStatus);
router.put("/transfer", isAdmin, transferStock);
router.post("/warehouses", isAdmin, createWarehouse);

module.exports = router;