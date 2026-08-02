const express = require("express");
const router = express.Router();

// Controller
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Authentication Middleware
const {
  verifyToken,
  isAdmin,
} = require("../middleware/authMiddleware");

// Upload Middleware
const upload = require("../middleware/uploadMiddleware");

// ======================================================
// Product Routes
// ======================================================

// Get All Products (Authenticated Users: Admin & Retailer)
router.get("/", verifyToken, getAllProducts);

// Get Single Product (Authenticated Users: Admin & Retailer)
router.get("/:id", verifyToken, getProductById);

// Add Product (Admin Only)
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addProduct
);

// Update Product (Admin Only)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updateProduct
);

// Delete Product (Admin Only)
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;