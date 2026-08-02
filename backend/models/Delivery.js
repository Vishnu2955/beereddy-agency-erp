const mongoose = require("mongoose");

const timelineItemSchema = new mongoose.Schema({
  status: { type: String, required: true },
  remarks: { type: String, default: "" },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  timestamp: { type: Date, default: Date.now },
});

const deliverySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: function () {
        return `DEL-${Date.now().toString().slice(-6)}`;
      },
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      default: "Store Manager",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    dispatchDate: {
      type: Date,
      default: null,
    },
    expectedDeliveryDate: {
      type: Date,
      default: function () {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
      },
    },
    deliveredDate: {
      type: Date,
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Packed",
        "Dispatched",
        "In Transit",
        "Out For Delivery",
        "Delivered",
        "Failed",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    proofOfDelivery: {
      receiverName: { type: String, default: "" },
      signatureUrl: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      invoicePhotoUrl: { type: String, default: "" },
      gpsLocation: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
      },
      otp: { type: String, default: "" },
      deliveredTime: { type: Date, default: null },
    },
    timeline: [timelineItemSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Delivery", deliverySchema);
