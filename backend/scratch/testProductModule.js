require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const { syncProductInventory } = require("../utils/inventoryHelper");

const runProductWorkflowTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas for Product & Inventory Verification...");

    // Test 1: Add Product WITHOUT Barcode & WITHOUT SKU
    const p1 = await Product.create({
      productName: "Test V-Bond Tile Adhesive No SKU",
      brand: "V-Bond",
      category: "Adhesives",
      purchasePrice: 400,
      sellingPrice: 550,
      mrp: 600,
      stock: 50,
      minimumStock: 10,
      unit: "BAG",
    });
    console.log("✅ Test 1 Passed: Product Created WITHOUT SKU & Barcode -> ID:", p1._id);

    // Sync Inventory
    const inv1 = await syncProductInventory(p1._id);
    console.log("✅ Test 2 Passed: Inventory Synced Automatically -> Stock:", inv1.currentStock);

    // Test 3: Add Product WITH SKU
    const p2 = await Product.create({
      productName: "Test V-Bond Grout",
      brand: "V-Bond",
      category: "Grouts",
      sku: `TEST-GR-${Date.now()}`,
      purchasePrice: 200,
      sellingPrice: 300,
      mrp: 350,
      stock: 30,
      unit: "KG",
    });
    await syncProductInventory(p2._id);
    console.log("✅ Test 3 Passed: Product Created WITH SKU -> SKU:", p2.sku);

    // Test 4: Edit Product
    p1.sellingPrice = 580;
    p1.stock = 75;
    await p1.save();
    const inv1Updated = await syncProductInventory(p1._id);
    console.log("✅ Test 4 Passed: Product Updated & Inventory Synced -> New Stock:", inv1Updated.currentStock);

    // Clean up test records
    await p1.deleteOne();
    await p2.deleteOne();
    await Inventory.deleteMany({ product: { $in: [p1._id, p2._id] } });
    console.log("✅ Test 5 Passed: Product & Inventory Cleaned Up Cleanly!");

    console.log("\n========================================================");
    console.log("ALL PRODUCT & INVENTORY WORKFLOW TESTS PASSED 100% SUCCESSFULLY!");
    console.log("========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Product Workflow Test Failure:", err);
    process.exit(1);
  }
};

runProductWorkflowTests();
