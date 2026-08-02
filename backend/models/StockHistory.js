const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Purchase",
        "Sale",
        "Return",
        "Adjustment",
        "Damage",
        "Manual Edit",
        "Transferred",
        "Reservation",
        "Unreservation",
      ],
      required: true,
    },
    reason: {
      type: String,
      default: "Stock Movement",
    },
    referenceDoc: {
      type: String,
      default: "",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);
