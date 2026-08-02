const { exec } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const backupFolderPath = process.argv[2];

if (!backupFolderPath) {
  console.log("Usage: node scripts/restore.js <PATH_TO_BACKUP_FOLDER>");
  process.exit(1);
}

console.log(`Restoring MongoDB database from ${backupFolderPath}...`);

const cmd = `mongorestore --uri="${process.env.MONGO_URI}" "${backupFolderPath}"`;

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Mongo Restore Failed:", error.message);
    return;
  }
  console.log("✅ MongoDB Database Restored Successfully!");
});
