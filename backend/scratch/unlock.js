require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const unlockAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoAtlas...");
    const res = await User.updateMany({}, { $set: { failedLoginAttempts: 0, lockUntil: null } });
    console.log("Unlocked all user accounts:", res);
    process.exit(0);
  } catch (err) {
    console.error("Unlock error:", err);
    process.exit(1);
  }
};

unlockAll();
