const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

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
// ==============================
// Send Email OTP
// ==============================
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendEmail(
      user.email,
      "Beereddy ERP - Password Reset OTP",
      `
      <div style="font-family:Arial,sans-serif">
        <h2>Beereddy ERP</h2>

        <p>Your password reset OTP is:</p>

        <h1 style="letter-spacing:4px;color:#2563eb;">
          ${otp}
        </h1>

        <p>This OTP is valid for <b>5 minutes</b>.</p>

        <p>If you didn't request this, you can ignore this email.</p>
      </div>
      `
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ==============================
// Verify OTP
// ==============================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    console.log("Entered OTP:", JSON.stringify(otp));
    console.log("Stored OTP :", JSON.stringify(user.otp));
    console.log("Entered Type:", typeof otp);
    console.log("Stored Type :", typeof user.otp);

    console.log("Entered OTP:", JSON.stringify(otp));
console.log("Stored OTP :", JSON.stringify(user.otp));
console.log("Entered Type:", typeof otp);
console.log("Stored Type :", typeof user.otp);

if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
}

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// Reset Password
// ==============================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
};