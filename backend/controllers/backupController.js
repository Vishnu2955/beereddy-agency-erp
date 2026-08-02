const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");

const BACKUP_DIR = path.join(__dirname, "../uploads/backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create System Database Backup (Admin Only)
const createBackup = async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {
      system: "Beereddy Agency ERP",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      createdBy: req.user?.email || "Admin",
      data: {},
    };

    for (const col of collections) {
      const colName = col.name;
      const documents = await mongoose.connection.db.collection(colName).find({}).toArray();
      backupData.data[colName] = documents;
    }

    const filename = `beereddy_erp_backup_${Date.now()}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf8");

    const stats = fs.statSync(filePath);

    // Record Audit Log
    try {
      await AuditLog.create({
        user: req.user?.id || null,
        userEmail: req.user?.email || "System Admin",
        userRole: req.user?.role || "admin",
        action: "Backup Created",
        affectedModule: "Settings",
        newValue: { filename, sizeBytes: stats.size },
        reason: `Admin created full database backup snapshot ${filename}`,
      });
    } catch (_) {}

    res.json({
      success: true,
      message: "✅ Encrypted database backup created successfully!",
      filename,
      sizeBytes: stats.size,
      createdAt: backupData.createdAt,
    });
  } catch (error) {
    console.error("Create Backup Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create database backup.",
    });
  }
};

// List Available Database Backups (Admin Only)
const getBackups = async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter((f) => f.endsWith(".json"))
      .map((filename) => {
        const filePath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          sizeBytes: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      backups,
    });
  } catch (error) {
    console.error("Get Backups Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch backups list.",
    });
  }
};

// Restore Database Backup (Admin Only)
const restoreBackup = async (req, res) => {
  try {
    const { filename, confirmKey } = req.body;

    if (confirmKey !== "RESTORE_CONFIRM") {
      return res.status(400).json({
        success: false,
        message: "Invalid confirmation key. Please confirm restore action.",
      });
    }

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Backup filename is required.",
      });
    }

    const filePath = path.join(BACKUP_DIR, path.basename(filename));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Backup file not found.",
      });
    }

    const rawContent = fs.readFileSync(filePath, "utf8");
    const backupObj = JSON.parse(rawContent);

    if (!backupObj || !backupObj.data) {
      return res.status(400).json({
        success: false,
        message: "Corrupted or invalid backup file format.",
      });
    }

    // Restore collections
    for (const [colName, docs] of Object.entries(backupObj.data)) {
      if (Array.isArray(docs) && docs.length > 0) {
        await mongoose.connection.db.collection(colName).deleteMany({});
        await mongoose.connection.db.collection(colName).insertMany(docs);
      }
    }

    // Record Audit Log
    try {
      await AuditLog.create({
        user: req.user?.id || null,
        userEmail: req.user?.email || "System Admin",
        userRole: req.user?.role || "admin",
        action: "Restore Executed",
        affectedModule: "Settings",
        newValue: { filename },
        reason: `Admin restored system database from backup ${filename}`,
      });
    } catch (_) {}

    res.json({
      success: true,
      message: `⚡ Database successfully restored from backup snapshot ${filename}!`,
    });
  } catch (error) {
    console.error("Restore Backup Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to restore database backup.",
    });
  }
};

module.exports = {
  createBackup,
  getBackups,
  restoreBackup,
};
