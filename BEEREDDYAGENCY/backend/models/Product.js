const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    mrp: {
      type: Number,
      required: true,
      default: 0,
    },

    gst: {
      type: Number,
      default: 18,
    },

    stock: {
      type: Number,
      default: 0,
    },

    minimumStock: {
      type: Number,
      default: 5,
    },

    unit: {
      type: String,
      default: "PCS",
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);