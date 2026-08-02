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
const settingsRoutes = require("./routes/settingsRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const driverRoutes = require("./routes/driverRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const crmRoutes = require("./routes/crmRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const auditRoutes = require("./routes/auditRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const securityRoutes = require("./routes/securityRoutes");
const backupRoutes = require("./routes/backupRoutes");
const systemRoutes = require("./routes/systemRoutes");
const diagnosticsRoutes = require("./routes/diagnosticsRoutes");
const { setSecurityHeaders, sanitizeInput, loginRateLimiter, apiRateLimiter } = require("./middleware/securityMiddleware");
const { maintenanceMiddleware } = require("./middleware/maintenanceMiddleware");
const { startBackupScheduler } = require("./utils/backupScheduler");
const { performanceLogger } = require("./middleware/performanceLogger");

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded =", !!process.env.EMAIL_PASS);
// Connect Database & Initialize Backup Scheduler
connectDB().then(() => {
  startBackupScheduler();
});

const app = express();

// Security Headers, Performance Logger, Sanitizer & Maintenance Filter
app.use(setSecurityHeaders);
app.use(performanceLogger);
app.use(sanitizeInput);
app.use(maintenanceMiddleware);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static Folder for Product Images & Frontend PWA Assets
const path = require("path");
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/manifest.json"));
});

app.get("/sw.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/sw.js"));
});

app.get("/icon-192.png", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/icon-192.png"));
});

app.get("/icon-512.png", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/icon-512.png"));
});

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
app.use("/api/settings", settingsRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/diagnostics", diagnosticsRoutes);

// Monitoring Health Check Route
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "HEALTHY",
    service: "Beereddy Agency ERP Backend API",
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    memoryUsage: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
  });
});

app.get("/status", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "OPERATIONAL",
    environment: process.env.NODE_ENV || "production",
    database: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
    uptimeSeconds: process.uptime(),
  });
});

app.get("/version", (req, res) => {
  res.json({
    name: "Beereddy Agency ERP",
    version: "1.0.0",
    build: "100",
    releaseDate: "2026-08-02",
    environment: process.env.NODE_ENV || "production",
  });
});

// Global Centralized Error Catcher & Bug Reporting Middleware
app.use(async (err, req, res, next) => {
  console.error("🔥 Global System Error Captured:", err.message);

  try {
    const BugReport = require("./models/BugReport");
    await BugReport.create({
      module: req.originalUrl || "Express Route",
      errorName: err.name || "Error",
      errorMessage: err.message || "Unhandled System Exception",
      stackTrace: err.stack || "",
      severity: err.status >= 500 ? "High" : "Medium",
      userEmail: req.user?.email || "System Catcher",
    });
  } catch (_) {}

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An internal system error occurred. Details captured in Diagnostics.",
  });
});

// Serve Web App SPA index.html for non-API routes
app.get("/*splat", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "API Route Not Found",
    });
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on Port ${PORT} (Network Host 0.0.0.0 Enabled)`);
});