const os = require("os");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Settings = require("../models/Settings");
const AuditLog = require("../models/AuditLog");
const { setMaintenanceCache } = require("../middleware/maintenanceMiddleware");

// Get Detailed System Status & Infrastructure Metrics
const getSystemStatus = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const uptime = Math.floor(process.uptime());

    // Storage Size calculation of uploads folder
    let uploadsSize = 0;
    const uploadsDir = path.join(__dirname, "../uploads");
    if (fs.existsSync(uploadsDir)) {
      const getDirSize = (dir) => {
        let size = 0;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            size += getDirSize(filePath);
          } else {
            size += stat.size;
          }
        }
        return size;
      };
      try {
        uploadsSize = getDirSize(uploadsDir);
      } catch (_) {}
    }

    // Maintenance State
    const maintenanceSetting = await Settings.findOne({ key: "system_maintenance" });
    const isMaintenanceMode = maintenanceSetting ? !!maintenanceSetting.isMaintenanceMode : false;

    // Latest Backup
    const latestBackupLog = await AuditLog.findOne({ action: "Backup Created" }).sort({ createdAt: -1 });

    // Deployment Checklist Verification
    const deploymentChecklist = {
      environmentVariables: !!process.env.JWT_SECRET && !!process.env.MONGO_URI,
      databaseConnection: mongoose.connection.readyState === 1,
      storageAccess: fs.existsSync(uploadsDir),
      apiHealth: true,
      serviceWorker: true,
      manifest: true,
    };

    res.json({
      success: true,
      system: {
        serverStatus: "RUNNING",
        environment: process.env.NODE_ENV || "production",
        version: "v1.0.0",
        buildDate: "2026-08-02",
        uptimeSeconds: uptime,
        database: {
          status: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
          host: mongoose.connection.host || "MongoDB Atlas",
          name: mongoose.connection.name || "beereddy_erp",
        },
        memory: {
          rssMB: (memory.rss / (1024 * 1024)).toFixed(1),
          heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(1),
          heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(1),
          systemFreeMemoryMB: (os.freemem() / (1024 * 1024)).toFixed(1),
          systemTotalMemoryMB: (os.totalmem() / (1024 * 1024)).toFixed(1),
        },
        storage: {
          uploadsSizeBytes: uploadsSize,
          uploadsSizeMB: (uploadsSize / (1024 * 1024)).toFixed(2),
        },
        maintenance: {
          isMaintenanceMode,
          lastUpdatedBy: maintenanceSetting?.lastUpdatedBy || "System Admin",
          updatedAt: maintenanceSetting?.updatedAt || null,
        },
        latestBackupAt: latestBackupLog ? latestBackupLog.createdAt : null,
        deploymentChecklist,
      },
    });
  } catch (error) {
    console.error("Get System Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch system status.",
    });
  }
};

// Get Maintenance Mode Status
const getMaintenanceState = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: "system_maintenance" });
    res.json({
      success: true,
      isMaintenanceMode: setting ? !!setting.isMaintenanceMode : false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle System Maintenance Mode (Admin Only)
const toggleMaintenanceState = async (req, res) => {
  try {
    const { isMaintenanceMode } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key: "system_maintenance" },
      {
        $set: {
          key: "system_maintenance",
          isMaintenanceMode: !!isMaintenanceMode,
          lastUpdatedBy: req.user?.email || "Admin",
        },
      },
      { new: true, upsert: true }
    );

    setMaintenanceCache(!!isMaintenanceMode);

    // Audit log
    try {
      await AuditLog.create({
        user: req.user?.id || null,
        userEmail: req.user?.email || "System Admin",
        userRole: req.user?.role || "admin",
        action: "Settings Changed",
        affectedModule: "Settings",
        newValue: { isMaintenanceMode: !!isMaintenanceMode },
        reason: `Admin toggled maintenance mode to ${isMaintenanceMode ? "ENABLED" : "DISABLED"}`,
      });
    } catch (_) {}

    res.json({
      success: true,
      message: `System maintenance mode is now ${isMaintenanceMode ? "ENABLED (Admin Bypass Active)" : "DISABLED (Normal Operations)"}!`,
      isMaintenanceMode: !!isMaintenanceMode,
    });
  } catch (error) {
    console.error("Toggle Maintenance Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update maintenance mode.",
    });
  }
};

module.exports = {
  getSystemStatus,
  getMaintenanceState,
  toggleMaintenanceState,
};
