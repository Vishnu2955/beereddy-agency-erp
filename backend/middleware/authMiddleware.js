const jwt = require("jsonwebtoken");

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Token format: Bearer <token>
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify User Active & Token Version Match (Revoke sessions if password changed)
    const User = require("../models/User");
    const dbUser = await User.findById(decoded.id).select("tokenVersion isActive role");

    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account disabled or invalid user session.",
      });
    }

    if (decoded.tokenVersion !== undefined && dbUser.tokenVersion !== undefined && dbUser.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session invalidated due to password change. Please log in with your new password.",
      });
    }

    // Store decoded user information
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Allow only Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  isAdmin,
};