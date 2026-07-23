const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// =========================================
// Sales Report
// =========================================
const getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $ne: "Cancelled" },
    }).populate("retailer", "fullName shopName");

    const totalSales = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalSales,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Stock Report
// =========================================
const getStockReport = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Retailer Purchase Report
// =========================================
const getRetailerSales = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $ne: "Cancelled" },
    }).populate("retailer", "fullName shopName");

    const report = {};

    orders.forEach((order) => {
      const id = order.retailer._id.toString();

      if (!report[id]) {
        report[id] = {
          retailer: order.retailer,
          totalOrders: 0,
          totalAmount: 0,
        };
      }

      report[id].totalOrders += 1;
      report[id].totalAmount += order.totalAmount;
    });

    res.status(200).json({
      success: true,
      report: Object.values(report),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Summary Report
// =========================================
const getSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalRetailers = await User.countDocuments({
      role: "retailer",
    });
    const totalOrders = await Order.countDocuments();

    const sales = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalProducts,
        totalRetailers,
        totalOrders,
        totalSales: sales.length ? sales[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSalesReport,
  getStockReport,
  getRetailerSales,
  getSummary,
};