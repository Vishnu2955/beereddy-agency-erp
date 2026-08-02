const { createBackup } = require("../controllers/backupController");

const startBackupScheduler = () => {
  // Run daily backup every 24 hours (86,400,000 ms)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  console.log("⏰ Automated Daily Database Backup Scheduler Initialized");

  setInterval(async () => {
    try {
      console.log("🔄 Executing scheduled daily database backup snapshot...");
      const mockReq = {
        user: { email: "Automated System Scheduler", role: "admin", id: null },
      };
      const mockRes = {
        json: (data) => console.log("✅ Scheduled Backup Created Successfully:", data.filename),
        status: () => mockRes,
      };

      await createBackup(mockReq, mockRes);
    } catch (err) {
      console.error("❌ Scheduled Daily Backup Warning:", err.message);
    }
  }, TWENTY_FOUR_HOURS);
};

module.exports = {
  startBackupScheduler,
};
