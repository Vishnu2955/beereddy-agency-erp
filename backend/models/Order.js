const mongoose = require("mongoose");

// ==============================
// Order Item Schema
// ==============================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

// ==============================
// Order Schema
// ==============================

const orderSchema = new mongoose.Schema(
  {
    // Invoice Number
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Retailer
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Ordered Products
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, "Order must contain at least one item."],
    },

    // Amount Before GST/Discount
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Discount
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // GST
    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Grand Total
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Method
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "Bank Transfer",
        "Cheque",
        "Credit",
      ],
      default: "Cash",
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partially Paid",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
      index: true,
    },

    // Order Status
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Confirmed",
        "Processing",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    // Delivery Date
    deliveryDate: {
      type: Date,
    },

    // Admin Notes
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },

    // Retailer Remarks
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==============================
// Virtual ID
// ==============================

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// ==============================
// Auto Calculate Subtotal
// ==============================
orderSchema.pre("save", function () {
  this.items.forEach((item) => {
    item.subtotal =
      Number(item.quantity || 0) *
      Number(item.price || 0);
  });
});
     

// ==============================
// Indexes
// ==============================

orderSchema.index({ createdAt: -1 });
orderSchema.index({ retailer: 1, createdAt: -1 });


// ==============================

module.exports = mongoose.model("Order", orderSchema);