require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const Product = require("../models/Product");

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    const collection = mongoose.connection.db.collection("products");

    // Drop legacy indexes
    try { await collection.dropIndex("sku_1"); } catch (_) {}
    try { await collection.dropIndex("barcode_1"); } catch (_) {}

    // Create partial unique index on SKU
    await collection.createIndex(
      { sku: 1 },
      {
        unique: true,
        partialFilterExpression: { sku: { $type: "string" } },
      }
    );
    console.log("✅ Successfully created partial unique index on sku_1!");
    process.exit(0);
  } catch (err) {
    console.error("Fix indexes error:", err);
    process.exit(1);
  }
};

fixIndexes();
