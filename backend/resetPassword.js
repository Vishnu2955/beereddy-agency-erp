const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const user = await User.findOneAndUpdate(
      {
        email: "admin@beereddy.com",
      },
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );

    if (!user) {
      console.log("❌ User not found");
    } else {
      console.log("✅ Password Reset Successfully");
      console.log("Email: admin@beereddy.com");
      console.log("Password: Admin@123");
    }

    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });