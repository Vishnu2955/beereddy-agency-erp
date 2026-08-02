const express = require("express");
const router = express.Router();

const {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  assignDelivery,
  updateDeliveryStatus,
  uploadProofOfDelivery,
  createDeliveryReturn,
  getDeliveryDashboard,
} = require("../controllers/deliveryController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getAllDeliveries);
router.get("/dashboard", getDeliveryDashboard);
router.get("/:id", getDeliveryById);
router.post("/", isAdmin, createDelivery);
router.put("/assign", isAdmin, assignDelivery);
router.put("/status", updateDeliveryStatus);
router.put("/proof", uploadProofOfDelivery);
router.post("/return", createDeliveryReturn);

module.exports = router;
