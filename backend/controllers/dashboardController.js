const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// ==============================
// Dashboard Statistics (Real-Time DB Aggregations)
// ==============================
const getDashboardStats = async (req, res) => {
  try {
    const isRetailer = req.user && req.user.role === "retailer";
    const retailerId = isRetailer ? new mongoose.Types.ObjectId(req.user.id) : null;

    const totalProducts = await Product.countDocuments({ isActive: true });

    const totalRetailers = isRetailer
      ? 1
      : await User.countDocuments({ role: "retailer" });

    const totalCustomers = isRetailer
      ? 1
      : await User.countDocuments({ role: { $in: ["retailer", "customer"] } });

    const totalOrders = isRetailer
      ? await Order.countDocuments({ retailer: retailerId })
      : await Order.countDocuments();

    const pendingOrders = isRetailer
      ? await Order.countDocuments({ retailer: retailerId, orderStatus: { $in: ["Pending", "Processing", "Packed", "Shipped"] } })
      : await Order.countDocuments({ orderStatus: "Pending" });

    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$minimumStock"] },
    });

    const matchStage = isRetailer ? { retailer: retailerId, orderStatus: { $ne: "Cancelled" } } : { orderStatus: { $ne: "Cancelled" } };

    // Total Lifetime Revenue
    const sales = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $ifNull: ["$finalAmount", "$totalAmount"] } },
        },
      },
    ]);
    const totalSales = sales.length > 0 ? sales[0].totalSales : 0;

    // Today's Sales Calculation
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayMatch = { ...matchStage, createdAt: { $gte: startOfToday } };
    const todaySalesAgg = await Order.aggregate([
      { $match: todayMatch },
      {
        $group: {
          _id: null,
          amount: { $sum: { $ifNull: ["$finalAmount", "$totalAmount"] } },
        },
      },
    ]);
    const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].amount : 0;

    // Monthly Sales Calculation
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthMatch = { ...matchStage, createdAt: { $gte: startOfMonth } };
    const monthSalesAgg = await Order.aggregate([
      { $match: monthMatch },
      {
        $group: {
          _id: null,
          amount: { $sum: { $ifNull: ["$finalAmount", "$totalAmount"] } },
        },
      },
    ]);
    const monthlySales = monthSalesAgg.length > 0 ? monthSalesAgg[0].amount : 0;

    // Calculate Outstanding Credit & Pending Payments
    let outstandingAmount = 0;
    let pendingPaymentsCount = 0;

    const unpaidFilter = isRetailer
      ? { retailer: retailerId, orderStatus: { $ne: "Cancelled" }, paymentStatus: { $ne: "Paid" } }
      : { orderStatus: { $ne: "Cancelled" }, paymentStatus: { $ne: "Paid" } };

    const unpaidOrders = await Order.find(unpaidFilter);
    pendingPaymentsCount = unpaidOrders.length;

    for (const ord of unpaidOrders) {
      const approvedPayments = await Payment.find({ order: ord._id, status: { $in: ["Approved", "Paid"] } });
      const paidForOrd = approvedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
      const ordTotal = Number(ord.finalAmount || ord.totalAmount || 0);
      outstandingAmount += Math.max(0, ordTotal - paidForOrd);
    }

    res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        totalRetailers,
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        totalSales,
        todaySales,
        monthlySales,
        pendingPayments: pendingPaymentsCount,
        outstandingAmount,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Recent Orders
// ==============================
const getRecentOrders = async (req, res) => {
  try {
    const isRetailer = req.user && req.user.role === "retailer";
    const filter = isRetailer ? { retailer: req.user.id } : {};

    const recentOrders = await Order.find(filter)
      .populate("retailer", "fullName shopName phone")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      total: recentOrders.length,
      recentOrders,
    });
  } catch (error) {
    console.error("Recent Orders Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Low Stock Products
// ==============================
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: ["$stock", "$minimumStock"],
      },
    });

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Monthly Sales / Purchases
// ==============================
const getMonthlySales = async (req, res) => {
  try {
    const isRetailer = req.user && req.user.role === "retailer";
    const matchStage = isRetailer ? { retailer: new mongoose.Types.ObjectId(req.user.id) } : {};

    const sales = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Monthly Sales Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Order Status Statistics
// ==============================
const getOrderStatus = async (req, res) => {
  try {
    const isRetailer = req.user && req.user.role === "retailer";
    const matchStage = isRetailer ? { retailer: new mongoose.Types.ObjectId(req.user.id) } : {};

    const status = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Top Selling Products
// ==============================
const getTopSellingProducts = async (req, res) => {
  try {
    const isRetailer = req.user && req.user.role === "retailer";
    const matchStage = isRetailer ? { retailer: new mongoose.Types.ObjectId(req.user.id) } : {};

    const products = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      topProducts: products,
    });
  } catch (error) {
    console.error("Top Products Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  getMonthlySales,
  getOrderStatus,
  getTopSellingProducts,
};