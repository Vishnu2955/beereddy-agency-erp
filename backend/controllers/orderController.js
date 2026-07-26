const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const Payment = require("../models/Payment");
// ======================================================
// Generate Invoice Number
// ======================================================

const generateInvoiceNumber = async () => {
  const count = await Order.countDocuments();

  const today = new Date();

  const date =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  return `INV-${date}-${String(count + 1).padStart(6, "0")}`;
};

// ======================================================
// Calculate Totals
// ======================================================

const calculateTotals = (items, discount = 0) => {
  let totalAmount = 0;

  items.forEach((item) => {
    totalAmount += item.price * item.quantity;
  });

  const gstAmount = Number((totalAmount * 0.18).toFixed(2));

  const finalAmount = Number(
    (totalAmount + gstAmount - discount).toFixed(2)
  );

  return {
    totalAmount,
    gstAmount,
    finalAmount,
  };
};

// ======================================================
// Create Order
// ======================================================

const createOrder = async (req, res) => {
  try {
    const {
      retailer,
      items,
      paymentMethod = "Cash",
      remarks = "",
      discount = 0,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one product.",
      });
    }

    let orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} has only ${product.stock} items in stock.`,
        });
      }

      
      console.log("Product:", product.productName);
      console.log("Selling Price:", product.sellingPrice);
      console.log("Quantity:", item.quantity);

      orderItems.push({
        product: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.sellingPrice,
      });
    }

    const totals = calculateTotals(orderItems, discount);
    console.log("Order Items:", orderItems);
    console.log("Totals:", totals);

    const invoiceNumber = await generateInvoiceNumber();

    const order = await Order.create({
      invoiceNumber,
      retailer,
      items: orderItems,
      totalAmount: totals.totalAmount,
      gstAmount: totals.gstAmount,
      discount,
      finalAmount: totals.finalAmount,
      paymentMethod,
      remarks,
    });
    const existingPayment = await Payment.findOne({
  order: order._id,
});

if (!existingPayment) {
  await Payment.create({
    retailer,
    order: order._id,
    amount: order.finalAmount,
    paymentMethod,
    status: "Pending",
    remarks: `Payment for ${order.invoiceNumber}`,
  });
}
    await Payment.create({
  retailer,
  order: order._id,
  amount: order.finalAmount,
  paymentMethod,
  status: "Pending",
  remarks: `Payment for ${order.invoiceNumber}`,
});

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Retailer - My Orders
// ======================================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      retailer: req.user.id,
    })
      .populate("retailer", "fullName shopName phone")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Admin - Get All Orders
// ======================================================

const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      retailer,
      paymentStatus,
      paymentMethod,
    } = req.query;

    let filter = {};

    if (status) filter.orderStatus = status;

    if (retailer) filter.retailer = retailer;

    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const orders = await Order.find(filter)
      .populate("retailer", "fullName shopName phone")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Get Single Order
// ======================================================

const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("retailer", "fullName shopName phone email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================================
// Update Order Status
// ======================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowedStatus = [
      "Pending",
      "Approved",
      "Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatus.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    // Restore stock if cancelled
    if (
  orderStatus === "Cancelled" &&
  order.orderStatus === "Delivered"
){
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

   
    if (
  orderStatus === "Delivered" &&
  order.orderStatus !== "Delivered"
) {

  for (const item of order.items) {

    const product = await Product.findById(item.product);

    if (!product) continue;

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `${product.productName} has only ${product.stock} items left.`,
      });
    }

    const previousStock = product.stock;

    product.stock -= item.quantity;

    await product.save();

    await Inventory.create({
      product: product._id,
      type: "OUT",
      quantity: item.quantity,
      previousStock,
      newStock: product.stock,
      reason: `Order ${order.invoiceNumber} Delivered`,
    });

  }

  order.deliveryDate = new Date();
}
order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================================
// Update Payment Status
// ======================================================

const updatePaymentStatus = async (req, res) => {

  try {

    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowed = [
      "Pending",
      "Partially Paid",
      "Paid",
      "Failed",
      "Refunded",
    ];

    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================================
// Cancel Order
// ======================================================

const cancelOrder = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled.",
      });
    }

    for (const item of order.items) {

      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }

    }

    order.orderStatus = "Cancelled";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================================
// Delete Order
// ======================================================

const deleteOrder = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================================
// Search Orders
// ======================================================

const searchOrders = async (req, res) => {

  try {

    const keyword = req.query.keyword || "";

    const orders = await Order.find()
      .populate("retailer", "fullName shopName phone")
      .sort({ createdAt: -1 });

    const filteredOrders = orders.filter((order) => {

      return (

        order.invoiceNumber
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||

        order.orderStatus
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||

        order.paymentStatus
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||

        order.retailer?.fullName
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||

        order.retailer?.shopName
          ?.toLowerCase()
          .includes(keyword.toLowerCase())

      );

    });

    res.status(200).json({
      success: true,
      totalOrders: filteredOrders.length,
      orders: filteredOrders,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
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