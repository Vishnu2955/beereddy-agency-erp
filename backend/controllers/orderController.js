const Order = require("../models/Order");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const {
  reserveStockForOrder,
  deductStockForApprovedOrder,
  restoreStockForCancelledOrder,
} = require("../utils/inventoryHelper");

// =========================================
// Place Order
// =========================================
const placeOrder = async (req, res) => {
  try {
    const {
      items,
      paymentMethod,
      discount = 0,
      gstAmount = 0,
      remarks = "",
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required.",
      });
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} has insufficient stock.`,
        });
      }

      const itemTotal = Number(product.sellingPrice || 0) * Number(item.quantity || 1);

      orderItems.push({
        product: product._id,
        productName: product.productName,
        sku: product.sku || "",
        quantity: item.quantity,
        price: product.sellingPrice,
        total: itemTotal,
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );

    // Calculate 18% GST (9% CGST + 9% SGST) if not explicitly provided
    const computedGst = gstAmount != null && Number(gstAmount) > 0 ? Number(gstAmount) : Math.round(totalAmount * 0.18);
    const finalAmount = totalAmount + computedGst - Number(discount || 0);

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      retailer: req.user.id,
      orderNumber,
      invoiceNumber,
      items: orderItems,
      totalAmount,
      gstAmount: computedGst,
      finalAmount,
      remainingBalance: finalAmount,
      deliveryAddress: req.body.deliveryAddress || "Retailer Store Address",
      paymentMethod: paymentMethod || "Cash on Delivery",
      discount,
      remarks,
      paymentStatus: req.body.paymentStatus || "Pending",
      orderStatus: "Pending",
      status: "Pending",
    });

    // Automatically deduct stock and update inventory in real-time when retailer places order
    await deductStockForApprovedOrder(order.items, req.user?.id, order.orderNumber);
    order.isStockDeducted = true;
    // Fetch fresh user object from DB to ensure shopName, fullName, and phone are accurate
    let currentUserObj = req.user;
    try {
      const User = require("../models/User");
      const dbUser = await User.findById(req.user?.id || req.user?._id);
      if (dbUser) currentUserObj = dbUser;
    } catch (_) {}

    const retailerShop = currentUserObj?.shopName ? ` (${currentUserObj.shopName})` : "";
    const retailerDisplayName = `${currentUserObj?.fullName || "Retailer Partner"}${retailerShop}`;

    // Create in-app Notification record for Admin Bell Icon 🔔
    try {
      const Notification = require("../models/Notification");
      await Notification.create({
        title: `New Order Placed (${order.orderNumber})`,
        message: `Order ${order.orderNumber} placed by ${retailerDisplayName} for ₹${totalAmount.toLocaleString('en-IN')}`,
        recipientType: "Admin",
        channel: "In-App",
        priority: "High",
        status: "Sent",
      });
    } catch (notifErr) {
      console.warn("In-App Notification warning:", notifErr.message);
    }

    // Trigger Automated Admin WhatsApp Notification (isolated in try-catch to guarantee order safety)
    let whatsappNotification = null;
    try {
      const { sendWhatsAppOrderNotification } = require("../utils/whatsappHelper");
      whatsappNotification = await sendWhatsAppOrderNotification(order, currentUserObj);
    } catch (waErr) {
      console.warn("WhatsApp Order Notification Warning (Order saved safely):", waErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Admin notified on WhatsApp.",
      order,
      whatsappNotification,
    });

  } catch (error) {
    console.error("Place Order Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error while placing order.",
    });
  }
};

// =========================================
// Get All Orders (Admin)
// =========================================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("retailer", "fullName shopName phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================
// Get My Orders (Retailer)
// =========================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      retailer: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================
// Update Order Status (Admin)
// =========================================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, status, paymentStatus } = req.body;
    const newStatus = orderStatus || status;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Deduct stock when Admin changes status to "Delivered" or "Approved" and stock hasn't been deducted yet
    if ((newStatus === "Delivered" || newStatus === "Approved") && !order.isStockDeducted) {
      await deductStockForApprovedOrder(order.items, req.user?.id, order.orderNumber);
      order.isStockDeducted = true;
    }

    // Restore stock if order is Cancelled
    if (newStatus === "Cancelled") {
      await restoreStockForCancelledOrder(order.items, req.user?.id, order.orderNumber);
      order.isStockDeducted = false;
    }

    if (newStatus) {
      order.orderStatus = newStatus;
      order.status = newStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${newStatus || paymentStatus}.`,
      order,
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// =========================================
// Delete Order
// =========================================
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: "Order deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Alias createOrder to placeOrder
const createOrder = placeOrder;

// Get Single Order
const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("retailer", "fullName shopName phone email address");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (req.user && req.user.role === "retailer") {
      const orderRetailerId = order.retailer?._id?.toString() || order.retailer?.toString();
      if (orderRetailerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You can only view your own order invoice.",
        });
      }
    }

    // Calculate total approved payments for this specific order
    const approvedPayments = await Payment.find({
      order: order._id,
      status: { $in: ["Approved", "Paid"] },
    });

    const totalPaidAmount = approvedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const orderGrandTotal = Number(order.finalAmount || order.totalAmount || 0);
    const remainingBalance = Math.max(0, orderGrandTotal - totalPaidAmount);

    const orderData = order.toObject();
    orderData.totalPaidAmount = totalPaidAmount;
    orderData.remainingBalance = remainingBalance;
    orderData.paymentHistory = approvedPayments;

    res.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Get Single Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Payment Status
const updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.paymentStatus = req.body.paymentStatus;

    await order.save();

    res.json({
      success: true,
      message: "Payment status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.orderStatus = "Cancelled";

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Search Orders
const searchOrders = async (req, res) => {
  try {
    const search = req.query.search || "";

    const orders = await Order.find({
      invoiceNumber: {
        $regex: search,
        $options: "i",
      },
    }).populate("retailer", "fullName shopName");

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  deleteOrder,
  searchOrders,
};