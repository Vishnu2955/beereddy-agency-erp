const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==============================
// Register User
// ==============================
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      shopName,
      phone,
      email,
      password,
      role,
      address,
      gstNumber,
      creditLimit,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone number",
      });
    }

    // Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      fullName,
      shopName,
      phone,
      email,
      password: hashedPassword,
      role,
      address,
      gstNumber,
      creditLimit,
    });

    // Response without password
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      shopName: user.shopName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      address: user.address,
      gstNumber: user.gstNumber,
      creditLimit: user.creditLimit,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: userResponse,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Login User
// ==============================
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find User
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Response without password
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      shopName: user.shopName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      address: user.address,
      gstNumber: user.gstNumber,
      creditLimit: user.creditLimit,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: userResponse,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};