const mongoose = require("mongoose");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.log("DNS setServers notice:", e.message);
}

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/beereddyagency";
  let connected = false;
  let attempts = 0;

  while (!connected && attempts < 5) {
    attempts++;
    try {
      console.log(`Connecting to MongoDB Atlas (Attempt ${attempts})...`);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });

      console.log("✅ MongoDB Connected Successfully");
      console.log("Host:", conn.connection.host);
      connected = true;
    } catch (error) {
      console.error(`⚠️ MongoDB Atlas Connection Attempt ${attempts} Failed:`, error.message);
      if (attempts >= 5) {
        console.log("Attempting local MongoDB fallback...");
        try {
          const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/beereddyagency", {
            serverSelectionTimeoutMS: 5000,
          });
          console.log("✅ Connected to Local MongoDB Fallback!");
          console.log("Host:", localConn.connection.host);
          connected = true;
        } catch (localErr) {
          console.error("❌ Both MongoDB Atlas and Local MongoDB connections failed.");
          console.error("👉 Fix: Please whitelist your current IP in MongoDB Atlas (Network Access -> Add IP -> 0.0.0.0/0).");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }
};

module.exports = connectDB;