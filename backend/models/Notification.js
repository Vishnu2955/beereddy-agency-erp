const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: function () {
        return `NOTIF-${Date.now().toString().slice(-6)}`;
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    recipientType: {
      type: String,
      enum: ["Admin", "Retailer", "Driver", "Employee", "All"],
      default: "Retailer",
    },
    channel: {
      type: String,
      enum: ["Email", "SMS", "WhatsApp", "Push", "In-App"],
      default: "In-App",
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Pending", "Sent", "Delivered", "Read", "Failed"],
      default: "Sent",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
