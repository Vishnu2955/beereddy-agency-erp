const Payment = require("../models/Payment");
const Order = require("../models/Order");

const recalculateOrderPaymentStatus = async (orderId) => {
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order) return;

  const approvedPayments = await Payment.find({
    order: orderId,
    status: { $in: ["Approved", "Paid"] },
  });

  const totalPaidForOrder = approvedPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const orderTotal = Number(order.finalAmount || order.totalAmount || 0);

  let newPaymentStatus = "Pending";
  if (totalPaidForOrder >= orderTotal && orderTotal > 0) {
    newPaymentStatus = "Paid";
  } else if (totalPaidForOrder > 0) {
    newPaymentStatus = "Partially Paid";
  }

  await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus: newPaymentStatus },
    { runValidators: false }
  );
};

const createPayment = async (req, res) => {
  try {
    const data = {
      ...req.body,
      retailer: req.body.retailer || (req.user && (req.user.id || req.user._id)),
      status: req.body.status || "Pending",
    };

    const paymentAmount = Number(data.amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero.",
      });
    }

    // Save uploaded screenshot if provided
    if (req.file) {
      data.screenshot = `/uploads/payments/${req.file.filename}`;
    }

    const payment = await Payment.create(data);

    // If payment is approved and linked to an order, recalculate order payment status
    if (payment.order && (payment.status === "Approved" || payment.status === "Paid")) {
      await recalculateOrderPaymentStatus(payment.order);
    }

    res.status(201).json({
      success: true,
      message: "Payment record created successfully.",
      payment,
    });

  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process payment record.",
    });
  }
};
// ==============================
// Get All Payments (Admin)
// ==============================
const getAllPayments = async (req, res) => {
  try {
    const isRetailer = req.user && req.user.role === "retailer";
    const filter = isRetailer ? { retailer: req.user.id } : {};

    const payments = await Payment.find(filter)
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
      await recalculateOrderPaymentStatus(payment.order);
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

    const linkedOrder = payment.order;
    await payment.deleteOne();

    if (linkedOrder) {
      await recalculateOrderPaymentStatus(linkedOrder);
    }

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