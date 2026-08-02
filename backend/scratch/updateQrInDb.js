require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const Settings = require("../models/Settings");

const updateQrSetting = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    await Settings.findOneAndUpdate(
      { key: "payment_settings" },
      { $set: { qrImage: "/admin_qr.jpg" } },
      { upsert: true, new: true }
    );

    console.log("✅ Successfully updated Admin QR setting to /admin_qr.jpg in MongoDB Atlas!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to update QR setting:", err);
    process.exit(1);
  }
};

updateQrSetting();
