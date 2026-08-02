const Settings = require("../models/Settings");

let cachedMaintenanceMode = false;
let lastCheckTime = 0;

const checkMaintenanceMode = async () => {
  const now = Date.now();
  // Cache for 5 seconds to minimize DB queries
  if (now - lastCheckTime < 5000) {
    return cachedMaintenanceMode;
  }

  try {
    const setting = await Settings.findOne({ key: "system_maintenance" });
    cachedMaintenanceMode = setting ? !!setting.isMaintenanceMode : false;
    lastCheckTime = now;
  } catch (_) {
    cachedMaintenanceMode = false;
  }
  return cachedMaintenanceMode;
};

const maintenanceMiddleware = async (req, res, next) => {
  // Allow health checks, login, and maintenance toggle routes
  if (
    req.path.includes("/health") ||
    req.path.includes("/api/auth/login") ||
    req.path.includes("/api/system/maintenance")
  ) {
    return next();
  }

  const isMaintenance = await checkMaintenanceMode();

  if (isMaintenance) {
    // If request has valid Admin token, allow bypass
    const userRole = req.user?.role;
    if (userRole === "admin") {
      return next();
    }

    return res.status(503).json({
      success: false,
      maintenance: true,
      message: "⚠️ Beereddy Agency ERP is currently under scheduled system maintenance. Please try again shortly.",
    });
  }

  next();
};

const setMaintenanceCache = (val) => {
  cachedMaintenanceMode = !!val;
  lastCheckTime = Date.now();
};

module.exports = {
  maintenanceMiddleware,
  setMaintenanceCache,
};
