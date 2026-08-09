const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
require("dotenv").config();
const Settings = require("../models/Settings");

async function updateAllSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas!");

    const res = await Settings.updateMany(
      {},
      {
        $set: {
          adminPayee: "Beereddy Upendar Reddy",
          ownerName: "Beereddy Upendar Reddy",
          upiVpa: "9876543210@ybl",
          accountName: "BEEREDDY UPENDAR REDDY (BEEREDDY AGENCY)",
          bankName: "State Bank of India",
          accountNumber: "40982341902",
          ifsc: "SBIN0020145",
          qrImage: "/admin_qr.jpg",
        },
      }
    );

    console.log("Updated DB Settings Result:", res);

    const currentSettings = await Settings.find({});
    console.log("Current DB Settings Documents:", currentSettings);

    mongoose.disconnect();
  } catch (err) {
    console.error("Error updating settings:", err);
  }
}

updateAllSettings();
