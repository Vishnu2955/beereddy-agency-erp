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
      enum: [
        "Login",
        "Logout",
        "Order Creation",
        "Inventory Change",
        "Payment Update",
        "Invoice Generation",
        "Role Change",
        "User Update",
        "Product Update",
        "Delete Operation",
        "Stock Purchase",
        "Stock Adjustment",
        "Delivery Status",
      ],
    },
    affectedModule: {
      type: String,
      required: true,
      enum: [
        "Auth",
        "Orders",
        "Inventory",
        "Payments",
        "Invoices",
        "Retailers",
        "Products",
        "Delivery",
        "CRM",
        "Settings",
      ],
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
