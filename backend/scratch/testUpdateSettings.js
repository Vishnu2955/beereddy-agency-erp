const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const Settings = require("../models/Settings");

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const updateData = {
      adminPayee: "VENNAPUSA VISHNUVARDHAN REDDY",
      accountName: "VENNAPUSA VISHNUVARDHAN REDDY",
      bankName: "State Bank of India (SBI)",
      accountNumber: "43175299261",
      ifsc: "SBIN0020167",
      branch: "wyra",
      upiVpa: "vihnu732s@axl",
      qrImage: "/admin_qr.jpg"
    };

    const res = await Settings.findOneAndUpdate(
      { key: "payment_settings" },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    console.log("SUCCESSFULLY UPDATED SETTINGS IN DB:", res);
  } catch (err) {
    console.error("DB UPDATE ERROR:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testUpdate();
