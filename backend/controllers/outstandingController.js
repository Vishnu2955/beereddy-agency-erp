const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");

// ===============================
// Get Outstanding of One Retailer
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

    const orders = await Order.find({
      retailer: retailerId,
      orderStatus: {
        $ne: "Cancelled",
      },
    });

    const totalOrders = orders.reduce(
      (sum, order) => sum + Number(order.finalAmount || 0),
      0
    );

    const payments = await Payment.find({
      retailer: retailerId,
      status: "Approved",
    });

    const totalPayments = payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const outstanding =
      totalOrders - totalPayments;

    res.json({
      success: true,
      retailer: {
        id: retailer._id,
        name:
          retailer.shopName ||
          retailer.fullName,
        creditLimit:
          retailer.creditLimit || 0,
        totalOrders,
        totalPayments,
        outstanding,
        availableCredit:
          (retailer.creditLimit || 0) -
          outstanding,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===============================
// All Retailers Outstanding
// ===============================
exports.getAllOutstanding =
  async (req, res) => {
    try {
      const retailers = await User.find({
        role: "retailer",
      });

      const result = [];

      for (const retailer of retailers) {
        const orders = await Order.find({
          retailer: retailer._id,
          orderStatus: {
            $ne: "Cancelled",
          },
        });

        const totalOrders =
          orders.reduce(
            (sum, order) =>
              sum +
              Number(
                order.finalAmount || 0
              ),
            0
          );

        const payments =
          await Payment.find({
            retailer: retailer._id,
            status: "Approved",
          });

        const totalPayments =
          payments.reduce(
            (sum, payment) =>
              sum +
              Number(payment.amount || 0),
            0
          );

        const outstanding =
          totalOrders -
          totalPayments;

        result.push({
          retailerId: retailer._id,
          retailer:
            retailer.shopName ||
            retailer.fullName,
          creditLimit:
            retailer.creditLimit || 0,
          outstanding,
          availableCredit:
            (retailer.creditLimit || 0) -
            outstanding,
        });
      }

      res.json({
        success: true,
        retailers: result,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };