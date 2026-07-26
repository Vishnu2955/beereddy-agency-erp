const dotenv = require("dotenv");
dotenv.config();
const express = require("express");

const cors = require("cors");

// Database
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const retailerRoutes = require("./routes/retailerRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contactRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const outstandingRoutes = require("./routes/outstandingRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded =", !!process.env.EMAIL_PASS);
// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static Folder for Product Images
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/outstanding", outstandingRoutes);
app.use("/api/inventory", inventoryRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Beereddy Agency ERP Backend Running Successfully",
    version: "1.0.0",
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});