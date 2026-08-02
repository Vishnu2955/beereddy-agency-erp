const Order = require("../models/Order");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Delivery = require("../models/Delivery");

// ==========================================
// 1. GET /api/analytics/dashboard (BI KPIs)
// ==========================================
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ orderStatus: { $ne: "Cancelled" } });
    const totalRetailers = await User.countDocuments({ role: "retailer" });

    // Total Approved Revenue
    const revenueAgg = await Payment.aggregate([
      { $match: { status: { $in: ["Approved", "Paid"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Total Inventory Value
    const inventoryItems = await Inventory.find().populate("product", "sellingPrice costPrice mrp");
    const inventoryValue = inventoryItems.reduce((sum, i) => {
      const price = Number(i.product?.sellingPrice || i.product?.costPrice || i.product?.mrp || 0);
      return sum + Math.max(0, i.currentStock) * price;
    }, 0);

    // Outstanding Dues
    const allRetailers = await User.find({ role: "retailer" });
    const allOrders = await Order.find({ orderStatus: { $ne: "Cancelled" } });
    const allPayments = await Payment.find({ status: { $in: ["Approved", "Paid"] } });

    let totalOutstanding = 0;
    allRetailers.forEach((r) => {
      const rOrders = allOrders.filter((o) => String(o.retailer) === String(r._id));
      const rPayments = allPayments.filter((p) => String(p.retailer) === String(r._id));
      const ordSum = rOrders.reduce((s, o) => s + Number(o.finalAmount || o.totalAmount || 0), 0);
      const paySum = rPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
      totalOutstanding += Math.max(0, ordSum - paySum);
    });

    res.json({
      success: true,
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalRetailers,
        inventoryValue: Math.round(inventoryValue * 100) / 100,
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      },
    });
  } catch (error) {
    console.error("Get Analytics Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GET /api/analytics/sales (Sales & Category Aggregation)
// ==========================================
exports.getSalesAnalytics = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: { $ifNull: ["$finalAmount", "$totalAmount"] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          quantitySold: { $sum: "$items.quantity" },
          revenueGenerated: { $sum: "$items.total" },
        },
      },
      { $sort: { revenueGenerated: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, monthlySales, topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. GET /api/analytics/inventory (Stock Turnover & Movements)
// ==========================================
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const stockDistribution = await Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalUnits: { $sum: "$currentStock" },
          availableUnits: { $sum: "$availableStock" },
        },
      },
    ]);

    res.json({ success: true, stockDistribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. GET /api/analytics/finance (Payment Trends & Profit)
// ==========================================
exports.getFinanceAnalytics = async (req, res) => {
  try {
    const paymentTrends = await Payment.aggregate([
      { $match: { status: { $in: ["Approved", "Paid"] } } },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, paymentTrends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
