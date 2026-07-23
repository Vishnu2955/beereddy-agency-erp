const Product = require("../models/Product");

// ==========================================
// Add Product
// ==========================================
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      brand,
      category,
      sku,
      barcode,
      purchasePrice,
      sellingPrice,
      mrp,
      gst,
      stock,
      minimumStock,
      unit,
      description,
    } = req.body;

    if (
      !productName ||
      !category ||
      !sku ||
      purchasePrice == null ||
      sellingPrice == null ||
      mrp == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product Name, Category, SKU, Purchase Price, Selling Price and MRP are required.",
      });
    }

    // SKU Check
    const skuExists = await Product.findOne({ sku });

    if (skuExists) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists.",
      });
    }

    // Barcode Check
    if (barcode) {
      const barcodeExists = await Product.findOne({ barcode });

      if (barcodeExists) {
        return res.status(400).json({
          success: false,
          message: "Barcode already exists.",
        });
      }
    }

    const product = await Product.create({
      productName,
      brand,
      category,
      sku,
      barcode,
      purchasePrice,
      sellingPrice,
      mrp,
      gst,
      stock,
      minimumStock,
      unit,
      description,
      image: req.file ? req.file.filename : "",
    });

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
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
// Get All Products (Search + Pagination)
// ==========================================
const getAllProducts = async (req, res) => {
  try {
    // Query Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    // Search Filter
    const filter = {};

    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    // Total Products
    const totalProducts = await Product.countDocuments(filter);

    // Fetch Products
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

    // SKU Check
    if (req.body.sku && req.body.sku !== product.sku) {
      const skuExists = await Product.findOne({
        sku: req.body.sku,
      });

      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists.",
        });
      }
    }

    // Barcode Check
    if (
      req.body.barcode &&
      req.body.barcode !== product.barcode
    ) {
      const barcodeExists = await Product.findOne({
        barcode: req.body.barcode,
      });

      if (barcodeExists) {
        return res.status(400).json({
          success: false,
          message: "Barcode already exists.",
        });
      }
    }

    Object.assign(product, req.body);

    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
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