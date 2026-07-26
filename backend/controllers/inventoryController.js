const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

// Get Inventory History
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("product", "productName brand stock")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Stock In
exports.stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const previousStock = product.stock;
    const newStock = previousStock + Number(quantity);

    product.stock = newStock;
    await product.save();

    const inventory = await Inventory.create({
      product: product._id,
      type: "IN",
      quantity,
      previousStock,
      newStock,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Stock Out
exports.stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const previousStock = product.stock;
    const newStock = previousStock - Number(quantity);

    product.stock = newStock;
    await product.save();

    const inventory = await Inventory.create({
      product: product._id,
      type: "OUT",
      quantity,
      previousStock,
      newStock,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Stock removed successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};