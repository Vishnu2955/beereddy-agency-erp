const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}).select("fullName phone email role").limit(5);
  console.log("Registered Users in DB:", users);
  mongoose.disconnect();
}

checkUser();
