const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const { sendNotification } = require("../services/notificationService");

const runAutomatedReminders = async () => {
  try {
    // 1. Pending Payment Reminders
    const unpaidOrders = await Order.find({ paymentStatus: { $ne: "Paid" } }).populate("retailer", "fullName email phone");
    for (const order of unpaidOrders.slice(0, 5)) {
      if (order.retailer?.email) {
        await sendNotification({
          title: `Overdue Payment Reminder: Order #${order.orderNumber}`,
          message: `Dear ${order.retailer.fullName}, an outstanding balance of ₹${order.remainingDue || order.totalAmount} is pending for Invoice #${order.invoiceNumber}. Please pay at your earliest convenience.`,
          recipientId: order.retailer._id,
          recipientType: "Retailer",
          channel: "Email",
          recipientEmail: order.retailer.email,
        });
      }
    }

    // 2. Low Stock Alerts
    const lowStockItems = await Inventory.find({ availableStock: { $lte: 10 } }).populate("product", "productName");
    if (lowStockItems.length > 0) {
      await sendNotification({
        title: `Low Stock Alert (${lowStockItems.length} Products)`,
        message: `${lowStockItems.length} products have reached minimum reorder limits. Please initiate supplier purchase entries.`,
        recipientType: "Admin",
        priority: "High",
      });
    }

    // 3. Driver License & Vehicle Expiries
    const expiringDrivers = await Driver.find({ licenseExpiry: { $lte: new Date(Date.now() + 30 * 86400000) } });
    if (expiringDrivers.length > 0) {
      await sendNotification({
        title: `Driver License Expiry Alert`,
        message: `${expiringDrivers.length} drivers have driving licenses expiring within 30 days.`,
        recipientType: "Admin",
        priority: "Normal",
      });
    }

    console.log("✅ Automated Background Reminders Engine Executed Successfully.");
  } catch (error) {
    console.error("Reminder Engine Error:", error);
  }
};

module.exports = { runAutomatedReminders };
