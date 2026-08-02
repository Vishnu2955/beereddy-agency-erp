const path = require("path");
const crypto = require("crypto");

// Whitelist allowed file extensions
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".xlsx", ".csv"];

// Blacklist dangerous executable extensions
const DANGEROUS_EXTENSIONS = [".exe", ".js", ".bat", ".cmd", ".sh", ".dll", ".msi", ".php", ".vbs", ".jar", ".ps1"];

const secureFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return cb(new Error("Security Alert: Executable file upload rejected!"), false);
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error("Invalid file type. Only Images (PNG/JPG/WEBP), PDF, Excel, and CSV files are allowed."), false);
  }

  cb(null, true);
};

const generateSecureFilename = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const randomName = crypto.randomBytes(16).toString("hex");
  return `secure_${Date.now()}_${randomName}${ext}`;
};

module.exports = {
  secureFileFilter,
  generateSecureFilename,
};
