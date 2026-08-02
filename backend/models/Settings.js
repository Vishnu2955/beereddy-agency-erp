const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "payment_settings",
      unique: true,
    },
    adminPayee: {
      type: String,
      default: "B UPENDER REDDY",
    },
    upiVpa: {
      type: String,
      default: "bupenderreddy@ybl",
    },
    bankName: {
      type: String,
      default: "State Bank of India",
    },
    accountName: {
      type: String,
      default: "B UPENDER REDDY (BEEREDDY AGENCY)",
    },
    accountNumber: {
      type: String,
      default: "40982341902",
    },
    ifsc: {
      type: String,
      default: "SBIN0020145",
    },
    qrImage: {
      type: String,
      default: "/admin_qr.jpg",
    },
    // Admin WhatsApp Settings
    adminWhatsAppNumber: {
      type: String,
      default: "",
    },
    whatsAppEnabled: {
      type: Boolean,
      default: false,
    },
    lastUpdatedBy: {
      type: String,
      default: "System Admin",
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
