const AuditLog = require("../models/AuditLog");

// ==========================================
// 1. GET /api/audit (List Audit Logs)
// ==========================================
exports.getAuditLogs = async (req, res) => {
  try {
    const { module: affectedModule, action, startDate, endDate, search } = req.query;
    const query = {};

    if (affectedModule) query.affectedModule = affectedModule;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let logs = await AuditLog.find(query)
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(200);

    if (search) {
      const term = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userEmail?.toLowerCase().includes(term) ||
          l.action?.toLowerCase().includes(term) ||
          l.affectedModule?.toLowerCase().includes(term) ||
          l.reason?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GET /api/audit/activity (Recent Activity Timeline)
// ==========================================
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await AuditLog.find()
      .populate("user", "fullName role")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, count: activities.length, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
