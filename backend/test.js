const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
require("dotenv").config();

(async () => {
  try {
    console.log("DNS:", dns.getServers());

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected!");
    console.log(conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();