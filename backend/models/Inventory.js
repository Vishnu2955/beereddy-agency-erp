const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      default: 10,
    },
    maximumStock: {
      type: Number,
      default: 500,
    },
    warehouseLocation: {
      type: String,
      default: "Rack A-1",
    },
    batchNumber: {
      type: String,
      default: function () {
        return `BATCH-${Date.now().toString().slice(-6)}`;
      },
    },
    supplier: {
      type: String,
      default: "V Bond Factory Direct",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically calculate availableStock = currentStock - reservedStock
inventorySchema.pre("save", function () {
  this.availableStock = Math.max(0, Number(this.currentStock || 0) - Number(this.reservedStock || 0));
  this.lastUpdated = new Date();
});

module.exports = mongoose.model("Inventory", inventorySchema);