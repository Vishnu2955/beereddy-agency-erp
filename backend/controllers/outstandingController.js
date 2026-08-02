const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");

// Helper to compute exact Grand Total including 18% GST for any order
const getOrderGrandTotal = (order) => {
  if (order.finalAmount && Number(order.finalAmount) > Number(order.totalAmount || 0)) {
    return Number(order.finalAmount);
  }
  const subtotal = Number(order.totalAmount || 0);
  const gst = Number(order.gstAmount || 0) > 0 ? Number(order.gstAmount) : Math.round(subtotal * 0.18);
  const discount = Number(order.discount || 0);
  return subtotal + gst - discount;
};

// ===============================
// Get Outstanding of One Retailer
// Formula: Outstanding = Total Order Amount (Incl. 18% GST) - Total Amount Paid
// ===============================
exports.getRetailerOutstanding = async (req, res) => {
  try {
    const retailerId = req.params.id;
    const retailer = await User.findById(retailerId);

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: "Retailer not found",
      });
    }

    // Get all non-cancelled orders for this retailer
    const orders = await Order.find({
      retailer: retailerId,
      orderStatus: { $ne: "Cancelled" },
    });

    const totalOrders = orders.reduce(
      (sum, order) => sum + getOrderGrandTotal(order),
      0
    );

    // Get all approved payments for this retailer
    const payments = await Payment.find({
      retailer: retailerId,
      status: { $in: ["Approved", "Paid"] },
    });

    const totalPayments = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const outstanding = Math.max(0, Math.round((totalOrders - totalPayments) * 100) / 100);
    const creditLimit = Number(retailer.creditLimit || 0);
    const availableCredit = Math.max(0, creditLimit - outstanding);

    res.json({
      success: true,
      retailer: {
        id: retailer._id,
        name: retailer.shopName || retailer.fullName,
        fullName: retailer.fullName,
        shopName: retailer.shopName,
        phone: retailer.phone,
        creditLimit,
        totalOrders,
        totalPayments,
        outstanding,
        availableCredit,
      },
    });
  } catch (err) {
    console.error("Get Retailer Outstanding Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// Get All Retailers Outstanding
// Formula: Outstanding = Total Order Amount (Incl. 18% GST) - Total Amount Paid
// ===============================
exports.getAllOutstanding = async (req, res) => {
  try {
    const retailers = await User.find({ role: "retailer" });
    const result = [];

    for (const retailer of retailers) {
      const orders = await Order.find({
        retailer: retailer._id,
        orderStatus: { $ne: "Cancelled" },
      });

      const totalOrders = orders.reduce(
        (sum, order) => sum + getOrderGrandTotal(order),
        0
      );

      const payments = await Payment.find({
        retailer: retailer._id,
        status: { $in: ["Approved", "Paid"] },
      });

      const totalPayments = payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      let rawOutstanding = totalOrders - totalPayments;
      let outstanding = Math.max(0, Math.round(rawOutstanding * 100) / 100);
      if (outstanding < 0.5) outstanding = 0;

      const creditLimit = Number(retailer.creditLimit || 0);
      const availableCredit = Math.max(0, creditLimit - outstanding);

      result.push({
        retailerId: retailer._id,
        retailer: retailer.shopName || retailer.fullName,
        shopName: retailer.shopName,
        fullName: retailer.fullName,
        phone: retailer.phone,
        creditLimit,
        totalOrders,
        totalPayments,
        outstanding,
        availableCredit,
      });
    }

    res.json({
      success: true,
      retailers: result,
    });
  } catch (err) {
    console.error("Get All Outstanding Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};