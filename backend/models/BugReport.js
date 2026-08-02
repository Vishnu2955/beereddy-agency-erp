const mongoose = require("mongoose");

const bugReportSchema = new mongoose.Schema(
  {
    bugId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return `BUG-${Date.now().toString().slice(-6)}`;
      },
    },
    module: {
      type: String,
      default: "System",
      trim: true,
    },
    errorName: {
      type: String,
      required: true,
      trim: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    stackTrace: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    userEmail: {
      type: String,
      default: "System Catcher",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BugReport", bugReportSchema);
