require("dotenv").config();
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}

const mongoose = require("mongoose");
const User = require("../models/User");

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");
    const users = await User.find({});
    console.log("Found", users.length, "users:");
    users.forEach((u) => {
      console.log(`- ID: ${u._id} | Role: ${u.role} | Name: "${u.fullName}" | Shop: "${u.shopName}" | Phone: "${u.phone}"`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Check users error:", err);
    process.exit(1);
  }
};

checkUsers();
