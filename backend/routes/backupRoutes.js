const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createBackup,
  getBackups,
  downloadBackup,
  restoreBackup,
  uploadAndRestoreBackup,
} = require("../controllers/backupController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const uploadDir = path.join(__dirname, "../uploads/backups");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `import_${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });

// Admin Backup & Restore Endpoints
router.get("/list", verifyToken, isAdmin, getBackups);
router.post("/create", verifyToken, isAdmin, createBackup);
router.get("/download/:filename", verifyToken, isAdmin, downloadBackup);
router.post("/restore", verifyToken, isAdmin, restoreBackup);
router.post("/import", verifyToken, isAdmin, upload.single("file"), uploadAndRestoreBackup);

module.exports = router;
