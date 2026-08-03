const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const StockHistory = require("../models/StockHistory");
const Notification = require("../models/Notification");
const ProductReturn = require("../models/ProductReturn");
const Delivery = require("../models/Delivery");
const bcrypt = require("bcrypt");

// Reset ERP (Admin Only)
const resetErp = async (req, res) => {
  try {
    const { confirmationPassword } = req.body;

    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Only Admin can reset the ERP." });
    }

    if (!confirmationPassword) {
      return res.status(400).json({ success: false, message: "Admin confirmation password is required to reset ERP." });
    }

    // Verify Admin Password
    const adminUser = await User.findById(req.user.id || req.user._id);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: "Admin user record not found." });
    }

    const isMatch = await bcrypt.compare(confirmationPassword, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid confirmation password. Reset cancelled." });
    }

    console.warn(`[ERP RESET INITIATED] Admin ${adminUser.fullName} (${adminUser.phone}) triggered full ERP reset.`);

    // 1. Delete Operational Documents
    await Order.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await StockHistory.deleteMany({});
    await Inventory.deleteMany({});
    await ProductReturn.deleteMany({});
    await Delivery.deleteMany({});
    await Notification.deleteMany({});
    await Product.deleteMany({});

    // 2. Delete Retailer Users (Keep Admin users)
    await User.deleteMany({ role: "retailer" });

    res.json({
      success: true,
      message: "ERP successfully reset as NEW. All transactional data, products, and retailer records cleared. Admin account and system settings preserved.",
      resetStats: {
        orders: 0,
        products: 0,
        retailers: 0,
        stock: 0,
        revenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
      },
    });

  } catch (error) {
    console.error("Reset ERP Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error while resetting ERP." });
  }
};

module.exports = {
  resetErp,
};
