const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  getPaymentSettings,
  updatePaymentSettings,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  testWhatsAppNotification,
} = require("../controllers/settingsController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Storage for uploaded QR code images
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `qr_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Public / Auth: Get current bank and QR details
router.get("/payment-details", getPaymentSettings);

// Admin Only: Update bank and QR details
router.put(
  "/payment-details",
  verifyToken,
  isAdmin,
  upload.single("qrImage"),
  updatePaymentSettings
);

// Admin WhatsApp Settings Routes
router.get("/whatsapp", verifyToken, isAdmin, getWhatsAppSettings);
router.put("/whatsapp", verifyToken, isAdmin, updateWhatsAppSettings);
router.post("/whatsapp/test", verifyToken, isAdmin, testWhatsAppNotification);

module.exports = router;
