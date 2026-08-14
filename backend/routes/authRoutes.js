const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { loginRateLimiter } = require("../middleware/securityMiddleware");
const {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateThemePreferences,
  getThemePreferences,
} = require("../controllers/authController");

// Protected against Brute-Force Password Dictionary Attacks
router.post("/register", loginRateLimiter, registerUser);
router.post("/login", loginRateLimiter, loginUser);

router.post("/send-otp", loginRateLimiter, sendOtp);
router.post("/verify-otp", loginRateLimiter, verifyOtp);
router.post("/reset-password", loginRateLimiter, resetPassword);

router.get("/theme", verifyToken, getThemePreferences);
router.put("/theme", verifyToken, updateThemePreferences);

module.exports = router;