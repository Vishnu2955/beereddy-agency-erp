const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");

dotenv.config({ path: path.join(__dirname, "../.env") });

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/beereddy_erp";

const AuditLog = require("../models/AuditLog");
const BugReport = require("../models/BugReport");
const Complaint = require("../models/Complaint");
const Contact = require("../models/Contact");
const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const FollowUp = require("../models/FollowUp");
const Inventory = require("../models/Inventory");
const Invoice = require("../models/Invoice");
const Lead = require("../models/Lead");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const ProductReturn = require("../models/ProductReturn");
const StockHistory = require("../models/StockHistory");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Warehouse = require("../models/Warehouse");

async function resetDatabase() {
  console.log("🧹 Connecting to MongoDB for Full Commercial ERP Data Reset...");
  console.log("   Target Database URI:", mongoURI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));

  await mongoose.connect(mongoURI);
  console.log("✅ MongoDB Connected successfully.");

  console.log("⚠️ Deleting all demo data across transactional & operational collections...");

  await Promise.all([
    Order.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    Product.deleteMany({}),
    Inventory.deleteMany({}),
    StockHistory.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    ProductReturn.deleteMany({}),
    Delivery.deleteMany({}),
    Driver.deleteMany({}),
    Vehicle.deleteMany({}),
    Warehouse.deleteMany({}),
    Ticket.deleteMany({}),
    Lead.deleteMany({}),
    FollowUp.deleteMany({}),
    Complaint.deleteMany({}),
    BugReport.deleteMany({}),
    Contact.deleteMany({}),
  ]);

  // Remove non-admin sample users (retailers, customers, etc.)
  const deletedUsers = await User.deleteMany({ role: { $ne: "admin" } });
  console.log(`  └─ Purged ${deletedUsers.deletedCount} non-admin demo users`);

  // Verify or Create Default Admin Account
  let adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      fullName: "Beereddy Agency Admin",
      phone: "9876543210",
      email: "admin@beereddyagency.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
      shopName: "Beereddy Agency Head Office",
    });
    console.log("  └─ Created Default Master Admin Account (phone: 9876543210 / pwd: admin123)");
  }

  // Print Collection Verification Summary
  const stats = {
    Products: await Product.countDocuments(),
    Orders: await Order.countDocuments(),
    Retailers: await User.countDocuments({ role: "retailer" }),
    Invoices: await Invoice.countDocuments(),
    Payments: await Payment.countDocuments(),
    InventoryRecords: await Inventory.countDocuments(),
    StockHistory: await StockHistory.countDocuments(),
    Notifications: await Notification.countDocuments(),
    AuditLogs: await AuditLog.countDocuments(),
    TotalAdmins: await User.countDocuments({ role: "admin" }),
  };

  console.log("\n📊 POST-RESET DATABASE VERIFICATION SUMMARY:");
  console.table(stats);

  console.log("✅ ERP DATABASE SUCCESSFULLY RESET TO BRAND-NEW COMMERCIAL INSTALLATION STATE!");
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error("❌ Reset Database Error:", err);
  process.exit(1);
});
