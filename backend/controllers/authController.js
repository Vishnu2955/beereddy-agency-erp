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

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      fullName,
      shopName,
      phone,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      address,
      gstNumber,
      creditLimit,
    });

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
// Login User (Single Login Field)
// Supports Email or Phone
// ==============================
const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validation
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Login and Password are required",
      });
    }

    // Remove extra spaces
    const loginValue = login.trim().toLowerCase();

    // Detect Email or Phone
    const isEmail = loginValue.includes("@");

    let user;

    if (isEmail) {
      user = await User.findOne({
        email: loginValue,
      });
    } else {
      user = await User.findOne({
        phone: login.trim(),
      });
    }

    // User Not Found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Account Disabled
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    // Password Check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // JWT Token
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

    // User Response
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