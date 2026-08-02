const mongoose = require("mongoose");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Settings = require("../models/Settings");

// Get Admin Security Dashboard Metrics
const getSecurityStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Logins Today
    const loginsToday = await AuditLog.countDocuments({
      action: "Login",
      reason: { $regex: /logged in successfully/i },
      createdAt: { $gte: startOfDay },
    });

    // 2. Failed Logins Today
    const failedLoginsToday = await AuditLog.countDocuments({
      action: "Login",
      reason: { $regex: /failed|locked/i },
      createdAt: { $gte: startOfDay },
    });

    // 3. Currently Blocked / Locked Accounts
    const blockedAccounts = await User.countDocuments({
      lockUntil: { $gt: new Date() },
    });

    // 4. Database Connection Status
    const dbStateMap = {
      0: "Disconnected",
      1: "Connected & Healthy",
      2: "Connecting",
      3: "Disconnecting",
    };
    const databaseStatus = dbStateMap[mongoose.connection.readyState] || "Unknown";

    // 5. Server Uptime
    const uptimeSeconds = Math.floor(process.uptime());

    // 6. Last Backup Date
    const lastBackupLog = await AuditLog.findOne({ action: "Backup Created" }).sort({ createdAt: -1 });

    // 7. Recent Security Activity Logs (Top 10)
    const recentActivity = await AuditLog.find({
      affectedModule: { $in: ["Auth", "Settings", "Retailers", "Products"] },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        loginsToday,
        failedLoginsToday,
        blockedAccounts,
        databaseStatus,
        uptimeSeconds,
        lastBackupAt: lastBackupLog ? lastBackupLog.createdAt : null,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get Security Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch security statistics.",
    });
  }
};

// Get Security Settings
const getSecuritySettings = async (req, res) => {
  try {
    let sec = await Settings.findOne({ key: "security_settings" });

    if (!sec) {
      sec = await Settings.create({
        key: "security_settings",
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        lockDurationMinutes: 15,
        rememberMeDays: 30,
        passwordMinLength: 10,
        maxUploadSizeMB: 10,
      });
    }

    res.json({
      success: true,
      settings: {
        sessionTimeoutMinutes: sec.sessionTimeoutMinutes || 60,
        maxLoginAttempts: sec.maxLoginAttempts || 5,
        lockDurationMinutes: sec.lockDurationMinutes || 15,
        rememberMeDays: sec.rememberMeDays || 30,
        passwordMinLength: sec.passwordMinLength || 10,
        maxUploadSizeMB: sec.maxUploadSizeMB || 10,
      },
    });
  } catch (error) {
    console.error("Get Security Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch security settings.",
    });
  }
};

// Update Security Settings (Admin Only)
const updateSecuritySettings = async (req, res) => {
  try {
    const {
      sessionTimeoutMinutes,
      maxLoginAttempts,
      lockDurationMinutes,
      rememberMeDays,
      passwordMinLength,
      maxUploadSizeMB,
    } = req.body;

    const updateData = {
      key: "security_settings",
      sessionTimeoutMinutes: Number(sessionTimeoutMinutes) || 60,
      maxLoginAttempts: Number(maxLoginAttempts) || 5,
      lockDurationMinutes: Number(lockDurationMinutes) || 15,
      rememberMeDays: Number(rememberMeDays) || 30,
      passwordMinLength: Number(passwordMinLength) || 10,
      maxUploadSizeMB: Number(maxUploadSizeMB) || 10,
    };

    const sec = await Settings.findOneAndUpdate(
      { key: "security_settings" },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Audit log
    try {
      await AuditLog.create({
        user: req.user?.id || null,
        userEmail: req.user?.email || "System Admin",
        userRole: req.user?.role || "admin",
        action: "Settings Changed",
        affectedModule: "Settings",
        newValue: updateData,
        reason: "Admin updated security policy parameters",
      });
    } catch (_) {}

    res.json({
      success: true,
      message: "⚡ Security policy settings updated successfully!",
      settings: sec,
    });
  } catch (error) {
    console.error("Update Security Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update security settings.",
    });
  }
};

module.exports = {
  getSecurityStats,
  getSecuritySettings,
  updateSecuritySettings,
};
