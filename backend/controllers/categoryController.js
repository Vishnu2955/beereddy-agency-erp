const Category = require("../models/Category");
const Product = require("../models/Product");

const DEFAULT_CATEGORIES = [
  { name: "Tile Adhesives", description: "V-Bond Polymer & Cementitious Tile Adhesives", icon: "FaBoxes", status: "active" },
  { name: "Tile Grouts", description: "Epoxy & Polymer Modified Grout Systems", icon: "FaFillDrip", status: "active" },
  { name: "Waterproofing", description: "Integral & Surface Waterproofing Compounds", icon: "FaWater", status: "active" },
  { name: "Chemicals", description: "Bonding Agents, Cleaners & Accelerators", icon: "FaFlask", status: "active" },
  { name: "Accessories", description: "Notched Trowels, Spacers & Tiling Tools", icon: "FaTools", status: "active" },
];

// Get All Categories (Auto-seeds if database has 0 categories)
const getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ createdAt: 1 });

    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find().sort({ createdAt: 1 });
    }

    // Dynamically calculate actual product count per category
    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    categoryCounts.forEach((c) => {
      if (c._id) countMap[c._id.toLowerCase()] = c.count;
    });

    const enrichedCategories = categories.map((cat) => {
      const count = countMap[cat.name.toLowerCase()] || 0;
      return { ...cat.toObject(), productCount: count };
    });

    res.json({ success: true, categories: enrichedCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Category "${name}" already exists.` });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      icon: icon || "FaBoxOpen",
      status: status || "active",
    });

    res.status(201).json({ success: true, message: "Category created successfully!", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, icon, status },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category updated successfully!", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Check if products are using this category
    const productsCount = await Product.countDocuments({ category: category.name });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because ${productsCount} product(s) are currently assigned to it.`,
      });
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
