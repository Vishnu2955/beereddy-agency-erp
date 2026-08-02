const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { recordAuditLog } = require("../middleware/auditLogger");

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
      shopName: shopName || fullName,
      phone,
      email: email ? email.toLowerCase().trim() : undefined,
      password: hashedPassword,
      role: role || "retailer",
      address: address || "",
      gstNumber: gstNumber || "",
      creditLimit: creditLimit || 0,
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
    const body = req.body || {};
    const login = body.login || body.email || body.phone;
    const password = body.password;

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

    // Account Disabled Check
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    // Check Account Lockout (15 minutes after 5 failed attempts)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMins = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to repeated failed login attempts. Try again in ${remainingMins} minute(s).`,
        lockUntil: user.lockUntil,
      });
    }

    // Password Check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLoginAt = new Date();

      const attemptsLeft = Math.max(0, 5 - user.failedLoginAttempts);

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
        await user.save();

        try {
          await recordAuditLog({
            req,
            user,
            action: "Login",
            affectedModule: "Auth",
            reason: `Account locked after 5 failed login attempts from IP ${req.ip || "127.0.0.1"}`,
          });
        } catch (_) {}

        return res.status(403).json({
          success: false,
          message: "Account locked! Maximum 5 failed login attempts exceeded. Try again in 15 minutes.",
          attemptsLeft: 0,
        });
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: `Invalid Password. ${attemptsLeft} attempt(s) remaining before account lockout.`,
        attemptsLeft,
      });
    }

    // Successful Login: Reset Lockout & Record Metadata
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    user.lastLoginUserAgent = req.headers["user-agent"] || "Unknown Agent";
    await user.save();

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

    // Record Audit Log for Login
    await recordAuditLog({
      req,
      user,
      action: "Login",
      affectedModule: "Auth",
      reason: `User ${user.fullName} (${user.role}) logged in successfully`,
    });

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