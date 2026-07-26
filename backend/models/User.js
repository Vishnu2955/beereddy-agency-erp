const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "retailer"],
      default: "retailer",
    },

    address: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      default: "",
    },

    creditLimit: {
  type: Number,
  default: 0,
},

isActive: {
  type: Boolean,
  default: true,
},

otp: {
  type: String,
  default: null,
},

otpExpires: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);