const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "payment_settings",
      unique: true,
    },
    // Company Profile & Setup Wizard Fields
    agencyName: {
      type: String,
      default: "Beereddy Agency",
    },
    ownerName: {
      type: String,
      default: "B Upender Reddy",
    },
    gstNumber: {
      type: String,
      default: "36AAAPB1234A1Z5",
    },
    phone: {
      type: String,
      default: "9876543210",
    },
    email: {
      type: String,
      default: "admin@beereddyagency.com",
    },
    address: {
      type: String,
      default: "Main Road, Near Bus Stand, Dist. Headquarters",
    },
    logo: {
      type: String,
      default: "/icon-192.png",
    },
    currency: {
      type: String,
      default: "₹",
    },
    financialYear: {
      type: String,
      default: "2026-2027",
    },
    invoicePrefix: {
      type: String,
      default: "BRA",
    },
    defaultTaxPercentage: {
      type: Number,
      default: 18,
    },
    isSetupCompleted: {
      type: Boolean,
      default: false,
    },
    // Banking & Payment Details
    adminPayee: {
      type: String,
      default: "Beereddy Upendar Reddy",
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
