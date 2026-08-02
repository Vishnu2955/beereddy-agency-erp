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
    }).populate("retailer", "fullName shopName phone");

    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.finalAmount || order.totalAmount || 0),
      0
    );

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalSales,
      orders,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
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
    const products = await Product.find().sort({ productName: 1 });

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error("Stock Report Error:", error);
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
    }).populate("retailer", "fullName shopName phone");

    const reportMap = {};

    orders.forEach((order) => {
      if (!order.retailer) return;

      const id = order.retailer._id.toString();

      if (!reportMap[id]) {
        reportMap[id] = {
          retailer: order.retailer,
          totalOrders: 0,
          totalAmount: 0,
        };
      }

      reportMap[id].totalOrders += 1;
      reportMap[id].totalAmount += Number(order.finalAmount || order.totalAmount || 0);
    });

    res.status(200).json({
      success: true,
      report: Object.values(reportMap),
    });
  } catch (error) {
    console.error("Retailer Sales Report Error:", error);
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
          total: {
            $sum: { $ifNull: ["$finalAmount", "$totalAmount"] },
          },
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
    console.error("Summary Report Error:", error);
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