const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["Bike", "Auto", "Pickup", "Mini Truck", "Lorry"],
      required: true,
      default: "Pickup",
    },
    ownerName: {
      type: String,
      default: "Beereddy Agency Direct",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    capacity: {
      type: Number,
      default: 1000, // kg or units
    },
    insuranceExpiry: {
      type: Date,
      default: null,
    },
    registrationExpiry: {
      type: Date,
      default: null,
    },
    fuelType: {
      type: String,
      enum: ["Diesel", "Petrol", "CNG", "Electric"],
      default: "Diesel",
    },
    currentStatus: {
      type: String,
      enum: ["Available", "On Delivery", "Maintenance", "Inactive"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
