const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Payment = require("../models/Payment");

// ==========================================
// SALES REPORT
// ==========================================
exports.getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    let filter = {};

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const orders = await Order.find(filter)
      .populate("retailer", "shopName fullName")
      .sort({ createdAt: -1 });

    const summary = orders.reduce(
      (acc, order) => {
        acc.totalSales += order.totalAmount || 0;
        acc.totalGST += order.gstAmount || 0;
        acc.totalDiscount += order.discount || 0;
        acc.grandTotal += order.finalAmount || 0;

        return acc;
      },
      {
        totalSales: 0,
        totalGST: 0,
        totalDiscount: 0,
        grandTotal: 0,
      }
    );

    res.json({
      success: true,
      summary,
      totalOrders: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// PRODUCT REPORT
// ==========================================
exports.getProductReport = async (req, res) => {
  try {
    const products = await Product.find().sort({
      productName: 1,
    });

    const inventoryValue = products.reduce(
      (sum, p) => sum + p.stock * p.sellingPrice,
      0
    );

    res.json({
      success: true,
      totalProducts: products.length,
      inventoryValue,
      products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// RETAILER REPORT
// ==========================================
exports.getRetailerReport = async (req, res) => {
  try {
    const retailers = await User.find({
      role: "retailer",
    }).select("-password");

    res.json({
      success: true,
      totalRetailers: retailers.length,
      retailers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// PAYMENT REPORT
// ==========================================
exports.getPaymentReport = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("retailer", "shopName fullName")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      totalPayments: payments.length,
      payments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};