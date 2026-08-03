const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateThemePreferences,
  getThemePreferences,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/theme", verifyToken, getThemePreferences);
router.put("/theme", verifyToken, updateThemePreferences);

module.exports = router;