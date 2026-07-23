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
// Product Routes (Admin Only)
// ======================================================

// Add Product
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addProduct
);

// Get All Products
router.get("/", verifyToken, isAdmin, getAllProducts);

// Get Single Product
router.get("/:id", verifyToken, isAdmin, getProductById);

// Update Product
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updateProduct
);

// Delete Product
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;