const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const { syncProductInventory } = require("../utils/inventoryHelper");
const { recordAuditLog } = require("../middleware/auditLogger");

// ==========================================
// Add Product
// ==========================================
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      brand = "",
      category,
      sku,
      purchasePrice,
      sellingPrice,
      mrp,
      gst = 18,
      stock = 0,
      minimumStock = 5,
      unit = "PCS",
      description = "",
    } = req.body;

    if (
      !productName ||
      !category ||
      purchasePrice == null ||
      sellingPrice == null ||
      mrp == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product Name, Category, Purchase Price, Selling Price and MRP are required.",
      });
    }

    const pPrice = Number(purchasePrice);
    const sPrice = Number(sellingPrice);
    const mPrice = Number(mrp);
    const taxRate = Number(gst || 18);

    if (pPrice < 0 || sPrice < 0 || mPrice < 0) {
      return res.status(400).json({ success: false, message: "Prices cannot be negative values." });
    }

    if (mPrice < sPrice) {
      return res.status(400).json({ success: false, message: "MRP (Maximum Retail Price) cannot be less than Selling Price." });
    }

    if (taxRate < 0 || taxRate > 28) {
      return res.status(400).json({ success: false, message: "GST percentage must be between 0% and 28%." });
    }

    // Optional SKU Validation & Formatting
    let finalSku = null;
    if (sku && String(sku).trim() !== "") {
      finalSku = String(sku).trim().toUpperCase();
      const skuExists = await Product.findOne({ sku: finalSku });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists. Please use a unique SKU or leave it blank.",
        });
      }
    }

    // Create Product
    const product = await Product.create({
      productName,
      brand,
      category,
      sku: finalSku,
      barcode: req.body.barcode || "",
      purchasePrice: pPrice,
      sellingPrice: sPrice,
      mrp: mPrice,
      gst: taxRate,
      stock: Number(stock || 0),
      minimumStock: Number(minimumStock || 5),
      unit: unit || "PCS",
      description,
      image: req.file ? req.file.filename : "",
    });

    // Synchronize Inventory Collection immediately
    await syncProductInventory(product._id);

    console.log("Created Product & Synced Inventory:", product);

    // Record Security Audit Log
    await recordAuditLog({
      req,
      action: "Product Update",
      affectedModule: "Products",
      newValue: { productName: product.productName, sku: product.sku, price: product.sellingPrice, stock: product.stock },
      reason: `Added new product ${product.productName} with ${product.stock} initial stock`,
    });

    return res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.error("========== ADD PRODUCT ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Products (Search + Pagination)
// ==========================================
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Default 100 for catalog views
    const search = req.query.search || "";

    const filter = {};

    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// Get Product By ID
// ==========================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==========================================
// Update Product
// ==========================================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // SKU Optional Unique Check
    if (req.body.sku !== undefined) {
      const newSku = req.body.sku && String(req.body.sku).trim() !== "" ? String(req.body.sku).trim().toUpperCase() : null;
      if (newSku && newSku !== product.sku) {
        const skuExists = await Product.findOne({ sku: newSku });
        if (skuExists) {
          return res.status(400).json({
            success: false,
            message: "SKU already exists.",
          });
        }
      }
      req.body.sku = newSku;
    }

    Object.assign(product, req.body);

    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();

    // Sync Inventory collection immediately
    await syncProductInventory(product._id);

    // Audit Log for Product Update
    await recordAuditLog({
      req,
      action: "Product Update",
      affectedModule: "Products",
      newValue: { productName: product.productName, stock: product.stock, sellingPrice: product.sellingPrice },
      reason: `Updated product details for ${product.productName}`,
    });

    res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// ==========================================
// Delete Product
// ==========================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Remove associated Inventory document if exists
    await Inventory.deleteMany({ product: product._id });

    // Audit Log for Product Deletion
    await recordAuditLog({
      req,
      action: "Delete Operation",
      affectedModule: "Products",
      oldValue: { productName: product.productName, sku: product.sku },
      reason: `Deleted product ${product.productName}`,
    });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
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
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};