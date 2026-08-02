const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const backupDir = path.join(__dirname, "../backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = path.join(backupDir, `beereddy_backup_${timestamp}`);

console.log(`Starting MongoDB Backup at ${new Date().toLocaleString()}...`);

const cmd = `mongodump --uri="${process.env.MONGO_URI}" --out="${outputFile}"`;

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Mongo Backup Failed:", error.message);
    return;
  }
  console.log(`✅ MongoDB Backup Completed Successfully! Folder: ${outputFile}`);
});
