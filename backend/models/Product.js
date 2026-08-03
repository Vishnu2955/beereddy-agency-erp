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
      default: null,
      uppercase: true,
      trim: true,
    },

    barcode: {
      type: String,
      default: null,
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

    mainImage: {
      type: String,
      default: "",
    },

    galleryImages: {
      type: [String],
      default: [],
    },

    viewer360Images: {
      type: [String],
      default: [],
    },

    videoUrl: {
      type: String,
      default: "",
    },

    brochureUrl: {
      type: String,
      default: "",
    },

    model3dUrl: {
      type: String,
      default: "",
    },

    viewer360Settings: {
      type: Object,
      default: {
        enabled: true,
        autoRotate: true,
        rotationSpeed: 3,
        zoomMin: 1,
        zoomMax: 4,
      },
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

// Enforce SKU uniqueness ONLY when SKU is a non-empty string
productSchema.index(
  { sku: 1 },
  {
    unique: true,
    partialFilterExpression: { sku: { $type: "string" } },
  }
);

module.exports = mongoose.model("Product", productSchema);