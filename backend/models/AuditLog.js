const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userEmail: {
      type: String,
      default: "System/Guest",
    },
    userRole: {
      type: String,
      default: "User",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    browser: {
      type: String,
      default: "Unknown Browser",
    },
    action: {
      type: String,
      required: true,
    },
    affectedModule: {
      type: String,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: "System Activity",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
