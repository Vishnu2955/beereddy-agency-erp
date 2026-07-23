const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

// ==============================
// Dashboard Statistics
// ==============================
const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const totalRetailers = await User.countDocuments({
      role: "retailer",
    });

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });

    const lowStockProducts = await Product.countDocuments({
      $expr: {
        $lte: ["$stock", "$minimumStock"],
      },
    });

    const sales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      sales.length > 0 ? sales[0].totalSales : 0;

    res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        totalRetailers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        totalSales,
      },
    });
  } catch (error) {
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
    const recentOrders = await Order.find()
      .populate("retailer", "fullName shopName phone")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      total: recentOrders.length,
      recentOrders,
    });
  } catch (error) {
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
// Monthly Sales
// ==============================
const getMonthlySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSales: {
            $sum: "$totalAmount",
          },
          totalOrders: {
            $sum: 1,
          },
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
    const status = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
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
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
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
    const products = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productName",
          totalQuantity: {
            $sum: "$items.quantity",
          },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$items.quantity",
                "$items.price",
              ],
            },
          },
        },
      },
      {
        $sort: {
          totalQuantity: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      topProducts: products,
    });
  } catch (error) {
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