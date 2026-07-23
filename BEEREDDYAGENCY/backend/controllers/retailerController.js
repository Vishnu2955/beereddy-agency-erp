const User = require("../models/User");
const bcrypt = require("bcrypt");

// =======================================================
// Add Retailer
// =======================================================
const addRetailer = async (req, res) => {
  try {
    const {
      fullName,
      shopName,
      phone,
      email,
      password,
      address,
      gstNumber,
      creditLimit,
    } = req.body;

    // Validation
    if (!fullName || !shopName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Shop Name, Phone and Password are required.",
      });
    }

    // Check Phone
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    // Check Email
    if (email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Retailer
    const retailer = await User.create({
      fullName,
      shopName,
      phone,
      email,
      password: hashedPassword,
      role: "retailer",
      address,
      gstNumber,
      creditLimit,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Retailer Added Successfully",
      retailer: {
        _id: retailer._id,
        fullName: retailer.fullName,
        shopName: retailer.shopName,
        phone: retailer.phone,
        email: retailer.email,
        address: retailer.address,
        gstNumber: retailer.gstNumber,
        creditLimit: retailer.creditLimit,
        role: retailer.role,
        isActive: retailer.isActive,
        createdAt: retailer.createdAt,
      },
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
// Get All Retailers
// =======================================================
const getAllRetailers = async (req, res) => {
  try {
    const retailers = await User.find({ role: "retailer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalRetailers: retailers.length,
      retailers,
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