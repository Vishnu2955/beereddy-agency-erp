const AuditLog = require("../models/AuditLog");

const recordAuditLog = async ({
  req,
  user = null,
  action,
  affectedModule,
  oldValue = null,
  newValue = null,
  reason = "Standard Audit Log",
}) => {
  try {
    const targetUser = user || req?.user;
    const ipAddress = req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1") : "127.0.0.1";
    const browser = req ? req.headers["user-agent"] || "Unknown" : "Server Agent";

    await AuditLog.create({
      user: targetUser?._id || targetUser?.id || null,
      userEmail: targetUser?.email || targetUser?.fullName || "Guest",
      userRole: targetUser?.role || "User",
      ipAddress: String(ipAddress),
      browser: String(browser).slice(0, 150),
      action,
      affectedModule,
      oldValue,
      newValue,
      reason,
    });
  } catch (err) {
    console.error("Record Audit Log Error:", err.message);
  }
};

module.exports = { recordAuditLog };
