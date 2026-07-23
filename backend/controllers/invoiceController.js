const Invoice = require("../models/Invoice");
const Order = require("../models/Order");

// =========================================
// Get All Invoices
// =========================================
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("retailer", "shopName fullName phone")
      .populate("order");

    res.status(200).json({
      success: true,
      totalInvoices: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices.",
    });
  }
};

// =========================================
// Get Invoice by Order ID
// =========================================
const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "retailer",
      "fullName shopName phone email address"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const gst = Number((subtotal * 0.18).toFixed(2));
    const grandTotal = Number((subtotal + gst).toFixed(2));

    res.status(200).json({
      success: true,
      invoice: {
        invoiceNumber: `INV-${order._id
          .toString()
          .slice(-6)
          .toUpperCase()}`,

        invoiceDate: order.createdAt,

        company: {
          name: "Beereddy Agency",
          address: "Nalgonda, Telangana",
          phone: "9876543210",
          email: "info@beereddyagency.com",
        },

        retailer: order.retailer,
        items: order.items,

        subtotal,
        gst,
        grandTotal,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Create Invoice
// =========================================
const createInvoice = async (req, res) => {
  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ order });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice already exists for this order.",
      });
    }

    // Find order
    const orderData = await Order.findById(order).populate("retailer");

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();

    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, "0")}`;

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      order: orderData._id,
      retailer: orderData.retailer._id,
      totalAmount: orderData.totalAmount,
      paymentStatus: orderData.paymentStatus,
      notes: "",
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      invoice,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Export Controllers
// =========================================
module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
};