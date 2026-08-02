require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const fixExistingNotifs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");
    const notifs = await Notification.find({ message: { $regex: /Retailer Retailer/i } });
    for (const n of notifs) {
      n.message = n.message.replace(/Retailer Retailer/g, "Retailer Partner");
      await n.save();
    }
    console.log(`Updated ${notifs.length} existing notification records.`);
    process.exit(0);
  } catch (err) {
    console.error("Fix notifs error:", err);
    process.exit(1);
  }
};

fixExistingNotifs();
