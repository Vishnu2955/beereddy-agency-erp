const dns = require("dns");

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("DNS Servers:", dns.getServers());

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
    console.log("Host:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Error");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;