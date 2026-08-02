const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: function () {
        return `DRV-${Date.now().toString().slice(-5)}`;
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    vehicleAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Available", "Busy", "Inactive"],
      default: "Available",
    },
    documents: [
      {
        docType: { type: String, default: "DL" },
        docUrl: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Driver", driverSchema);
