const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI Exists:", !!process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
    console.log(conn.connection.host);
  } catch (error) {
    console.log("❌ FULL ERROR");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;