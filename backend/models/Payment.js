const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Bank Transfer", "Cash", "Cheque"],
      default: "UPI",
    },

    transactionId: {
      type: String,
      trim: true,
    },

    screenshot: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);