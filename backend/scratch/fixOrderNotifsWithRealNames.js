require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Order = require("../models/Order");

const fixRealNames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");
    const notifs = await Notification.find({ title: { $regex: /Order/i } });

    for (const n of notifs) {
      const match = n.title.match(/(ORD-\d+)/) || n.message.match(/(ORD-\d+)/);
      if (match) {
        const orderNum = match[1];
        const orderDoc = await Order.findOne({ orderNumber: orderNum }).populate("retailer");
        if (orderDoc && orderDoc.retailer) {
          const ret = orderDoc.retailer;
          const shop = ret.shopName ? ` (${ret.shopName})` : "";
          const displayName = `${ret.fullName || ret.phone || "Retailer"}${shop}`;
          n.message = `Order ${orderNum} placed by ${displayName} for ₹${Number(orderDoc.totalAmount || 0).toLocaleString('en-IN')}`;
          await n.save();
          console.log(`Updated ${orderNum} -> "${n.message}"`);
        }
      }
    }
    console.log("Finished updating order notifications with real retailer names!");
    process.exit(0);
  } catch (err) {
    console.error("Fix error:", err);
    process.exit(1);
  }
};

fixRealNames();
