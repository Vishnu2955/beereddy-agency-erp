const User = require("../models/User");
const bcrypt = require("bcrypt");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// =======================================================
// Add Retailer
// =======================================================
const addRetailer = async (req, res) => {
  try {
    const {
      fullName,
      shopName,
      phone,
      password,
      email,
      address,
      gstNumber,
      creditLimit,
    } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Phone Number, and Password are required.",
      });
    }

    const cleanPhone = String(phone).trim();
    const phoneExists = await User.findOne({ phone: cleanPhone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists in system.",
      });
    }

    let cleanEmail = undefined;
    if (email && String(email).trim() !== "") {
      cleanEmail = String(email).trim().toLowerCase();
      const emailExists = await User.findOne({ email: cleanEmail });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email address already registered.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const retailer = await User.create({
      fullName: String(fullName).trim(),
      shopName: shopName && String(shopName).trim() !== "" ? String(shopName).trim() : String(fullName).trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: "retailer",
      address: address || "",
      gstNumber: gstNumber || "",
      creditLimit: Number(creditLimit || 0),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Retailer Account Created Successfully",
      retailer,
    });
  } catch (error) {
    console.error("ADD RETAILER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create retailer account.",
    });
  }
};

const getAllRetailers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const filter = { role: "retailer" };

    if (search && String(search).trim() !== "") {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalRetailers = await User.countDocuments(filter);
    const retailers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    const retailerData = await Promise.all(
      retailers.map(async (retailer) => {
        const orders = await Order.find({
          retailer: retailer._id,
          orderStatus: { $ne: "Cancelled" },
        });

        const totalOrders = orders.reduce(
          (sum, order) => sum + Number(order.finalAmount || order.totalAmount || 0),
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

        const rawOutstanding = Math.round((totalOrders - totalPayments) * 100) / 100;
        const outstanding = Math.max(0, rawOutstanding);

        return {
          ...retailer.toObject(),
          totalOrders,
          totalPayments,
          outstanding,
          availableCredit: Math.max(0, Number(retailer.creditLimit || 0) - outstanding),
        };
      })
    );

    res.status(200).json({
      success: true,
      totalRetailers,
      retailers: retailerData,
      totalPages: Math.ceil(totalRetailers / Number(limit)) || 1,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================================
// Get Retailer By ID
// =======================================================
const getRetailerById = async (req, res) => {
  try {
    const retailer = await User.findOne({
      _id: req.params.id,
      role: "retailer",
    }).select("-password");

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: "Retailer not found.",
      });
    }

    res.status(200).json({
      success: true,
      retailer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================================
// Update Retailer
// =======================================================
const updateRetailer = async (req, res) => {
  try {
    const retailer = await User.findOne({
      _id: req.params.id,
      role: "retailer",
    });

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: "Retailer not found.",
      });
    }

    const {
      fullName,
      shopName,
      phone,
      email,
      password,
      address,
      gstNumber,
      creditLimit,
      isActive,
    } = req.body;

    // Phone Validation
    if (phone && phone !== retailer.phone) {
      const phoneExists = await User.findOne({ phone });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone already exists.",
        });
      }

      retailer.phone = phone;
    }

    // Email Validation
    if (email && email !== retailer.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }

      retailer.email = email;
    }

    if (password) {
      retailer.password = await bcrypt.hash(password, 10);
    }

    if (fullName !== undefined) retailer.fullName = fullName;
    if (shopName !== undefined) retailer.shopName = shopName;
    if (address !== undefined) retailer.address = address;
    if (gstNumber !== undefined) retailer.gstNumber = gstNumber;
    if (creditLimit !== undefined) retailer.creditLimit = creditLimit;
    if (isActive !== undefined) retailer.isActive = isActive;

    await retailer.save();

    const updatedRetailer = await User.findById(retailer._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Retailer Updated Successfully",
      retailer: updatedRetailer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================================
// Delete Retailer
// =======================================================
const deleteRetailer = async (req, res) => {
  try {
    const retailer = await User.findOne({
      _id: req.params.id,
      role: "retailer",
    });

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: "Retailer not found.",
      });
    }

    await retailer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Retailer Deleted Successfully",
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
  addRetailer,
  getAllRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
};