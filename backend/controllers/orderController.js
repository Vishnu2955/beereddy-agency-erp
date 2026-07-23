const Order = require("../models/Order");
const Product = require("../models/Product");

// ======================================================
// Create Order
// ======================================================
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod = "Cash", remarks = "" } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items selected",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} is out of stock`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.sellingPrice,
      });

      totalAmount += product.sellingPrice * item.quantity;
    }

    const order = await Order.create({
      retailer: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
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
// Retailer - My Orders
// ======================================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      retailer: req.user.id,
    }).sort({
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
    const { status, retailer } = req.query;

    let filter = {};

    if (status) {
      filter.orderStatus = status;
    }

    if (retailer) {
      filter.retailer = retailer;
    }

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
      .populate("retailer", "fullName shopName phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
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
        message: "Order not found",
      });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    // Restore Stock
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
      message: "Order cancelled successfully",
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
        message: "Order not found",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
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
        order.retailer?.fullName
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||
        order.retailer?.shopName
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||
        order.orderStatus
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

// ======================================================
// module.exports
// ======================================================
module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  searchOrders,
};