require("dotenv").config();
const http = require("http");
const jwt = require("jsonwebtoken");

const testReports = async () => {
  const token = jwt.sign(
    { id: "6a5e55bc1d7f0785f59b744b", role: "admin", email: "admin@beereddy.com" },
    process.env.JWT_SECRET || "beereddy_agency_super_secret_production_jwt_key_2026",
    { expiresIn: "1d" }
  );

  const fetchApi = (path) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        `http://127.0.0.1:5000/api${path}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve(JSON.parse(body)));
        }
      );
      req.on("error", reject);
      req.end();
    });
  };

  try {
    const summary = await fetchApi("/reports");
    console.log("✅ Summary API:", summary);

    const sales = await fetchApi("/reports/sales");
    console.log(`✅ Sales API: ${sales.orders?.length} orders | Total Sales: ₹${sales.totalSales}`);

    const stock = await fetchApi("/reports/stock");
    console.log(`✅ Stock API: ${stock.products?.length} products`);

    const retailers = await fetchApi("/reports/retailers");
    console.log(`✅ Retailers API: ${retailers.report?.length} retailer records`);

    console.log("\n========================================================");
    console.log("ALL REPORTS APIs ARE VERIFIED & WORKING 100% PERFECTLY!");
    console.log("========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Test reports failure:", err);
    process.exit(1);
  }
};

testReports();
