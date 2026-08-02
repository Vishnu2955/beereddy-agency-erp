const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const token = jwt.sign(
  { id: "6a5e55bc1d7f0785f59b744b", role: "retailer", email: "retailer@beereddy.com" },
  process.env.JWT_SECRET || "beereddy_agency_super_secret_production_jwt_key_2026",
  { expiresIn: "1d" }
);

const req = http.request("http://127.0.0.1:5000/api/products", {
  method: "GET",
  headers: { Authorization: `Bearer ${token}` }
}, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    const data = JSON.parse(body);
    console.log(`✅ Products API Status: ${res.statusCode}`);
    console.log(`✅ Success: ${data.success}`);
    console.log(`✅ Found ${data.products?.length} products in DB.`);
    if (data.products?.length > 0) {
      console.log(`Sample product: ${data.products[0].productName} (Price: ₹${data.products[0].sellingPrice})`);
    }
  });
});
req.on("error", (err) => console.error("API error:", err));
req.end();
