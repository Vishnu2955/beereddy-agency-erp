const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: function () {
        return `LEAD-${Date.now().toString().slice(-5)}`;
      },
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    location: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["Direct Visit", "Phone Inquiry", "Website", "Referral", "Trade Fair", "Other"],
      default: "Direct Visit",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Negotiation", "Won", "Lost"],
      default: "New",
    },
    assignedSalesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);
