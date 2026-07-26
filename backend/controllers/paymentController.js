const Payment = require("../models/Payment");
const Order = require("../models/Order");

const createPayment = async (req, res) => {
  try {
    const data = {
      ...req.body,
    };

    // Get total non-cancelled orders
    const orders = await Order.find({
      retailer: data.retailer,
      orderStatus: { $ne: "Cancelled" },
    });

    const totalOrders = orders.reduce(
      (sum, order) => sum + Number(order.finalAmount || 0),
      0
    );

    // Get only approved payments
    const existingPayments = await Payment.find({
  retailer: data.retailer,
  status: { $in: ["Pending", "Approved"] },
});

const totalPaidOrPending = existingPayments.reduce(
  (sum, payment) => sum + Number(payment.amount || 0),
  0
);

const outstanding = totalOrders - totalPaidOrPending;
    const paymentAmount = Number(data.amount);

    // Validation
    if (paymentAmount > outstanding) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds outstanding amount. Remaining outstanding is ₹${outstanding.toLocaleString("en-IN")}.`,
      });
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero.",
      });
    }

    // Save uploaded screenshot
    if (req.file) {
      data.screenshot = `/uploads/payments/${req.file.filename}`;
    }

    const payment = await Payment.create(data);

    res.status(201).json({
      success: true,
      message: "Payment request submitted successfully.",
      payment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==============================
// Get All Payments (Admin)
// ==============================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("retailer", "fullName shopName phone")
      .populate("order", "invoiceNumber orderNumber totalAmount finalAmount")
      .populate("verifiedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Retailer's Payments
// ==============================
const getRetailerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      retailer: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Update Payment Status
// ==============================
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    payment.status = status;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();

    await payment.save();
    if (payment.order) {
  await Order.findByIdAndUpdate(payment.order, {
    paymentStatus:
      status === "Approved"
        ? "Paid"
        : status === "Rejected"
        ? "Failed"
        : "Pending",
  });
}

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Delete Payment
// ==============================
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getRetailerPayments,
  updatePaymentStatus,
  deletePayment,
};