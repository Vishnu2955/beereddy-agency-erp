const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Ensure upload directories exist using absolute paths
const uploadsDir = path.join(__dirname, "uploads");
const uploadsProductsDir = path.join(__dirname, "uploads/products");
const uploadsPaymentsDir = path.join(__dirname, "uploads/payments");
const uploadsBackupsDir = path.join(__dirname, "uploads/backups");

[uploadsDir, uploadsProductsDir, uploadsPaymentsDir, uploadsBackupsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Database Connection
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
const categoryRoutes = require("./routes/categoryRoutes");

// Custom Middleware
const { setSecurityHeaders, sanitizeInput } = require("./middleware/securityMiddleware");
const { maintenanceMiddleware } = require("./middleware/maintenanceMiddleware");
const { startBackupScheduler } = require("./utils/backupScheduler");
const { performanceLogger } = require("./middleware/performanceLogger");

// Track Mongo connection state for logging
let isMongoConnected = false;

// Connect Database & Initialize Backup Scheduler
connectDB()
  .then(() => {
    isMongoConnected = true;
    startBackupScheduler();
    console.log("✅ Mongo connected successfully");
  })
  .catch((err) => {
    console.error("⚠️ Mongo connection error on startup:", err.message);
  });

const app = express();

// Security Headers, Performance Logger, Sanitizer & Maintenance Filter
app.use(setSecurityHeaders);
app.use(performanceLogger);
app.use(sanitizeInput);
app.use(maintenanceMiddleware);

// Production-ready CORS Configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const validOrigins = allowedOrigins.flatMap((o) => o.split(",").map((s) => s.trim()));

    if (
      validOrigins.includes(origin) ||
      validOrigins.includes("*") ||
      process.env.NODE_ENV !== "production" ||
      origin.endsWith(".onrender.com")
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve Uploads using absolute path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Frontend Paths (Dist & Public)
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const frontendPublicPath = path.join(__dirname, "../frontend/public");
const isFrontendDetected = fs.existsSync(frontendDistPath);

if (isFrontendDetected) {
  app.use(express.static(frontendDistPath));
} else {
  console.warn(`⚠️ Warning: Frontend build directory not found at "${frontendDistPath}". Server continuing in API-only mode.`);
}

// Serve Static PWA & Root Files using absolute paths
const serveStaticFile = (fileName, mimeType) => (req, res) => {
  const distFile = path.join(frontendDistPath, fileName);
  const publicFile = path.join(frontendPublicPath, fileName);

  if (fs.existsSync(distFile)) {
    if (mimeType) res.setHeader("Content-Type", mimeType);
    return res.sendFile(distFile);
  }
  if (fs.existsSync(publicFile)) {
    if (mimeType) res.setHeader("Content-Type", mimeType);
    return res.sendFile(publicFile);
  }
  return res.status(404).json({ success: false, message: `File ${fileName} not found` });
};

app.get("/manifest.json", serveStaticFile("manifest.json", "application/json"));
app.get("/sw.js", serveStaticFile("sw.js", "application/javascript"));
app.get("/robots.txt", serveStaticFile("robots.txt", "text/plain"));
app.get("/icon-192.png", serveStaticFile("icon-192.png", "image/png"));
app.get("/icon-512.png", serveStaticFile("icon-512.png", "image/png"));
app.get("/favicon.ico", serveStaticFile("favicon.ico"));
app.get("/favicon.svg", serveStaticFile("favicon.svg", "image/svg+xml"));

// API Health Check Routes (Must always work and return clean JSON)
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection && mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED";
  res.status(200).json({
    status: "HEALTHY",
    service: "Beereddy Agency ERP Backend API",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    database: dbStatus,
    frontendDetected: isFrontendDetected,
  });
});

app.get("/status", (req, res) => {
  const dbStatus = mongoose.connection && mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED";
  res.status(200).json({
    status: "OPERATIONAL",
    environment: process.env.NODE_ENV || "production",
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get("/version", (req, res) => {
  res.status(200).json({
    name: "Beereddy Agency ERP",
    version: "1.0.0",
    build: "100",
    releaseDate: "2026-08-02",
    environment: process.env.NODE_ENV || "production",
  });
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
app.use("/api/categories", categoryRoutes);

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

// Catch-all SPA Handler for non-API routes
app.get("*splat", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "API Route Not Found",
    });
  }

  const indexPath = path.join(frontendDistPath, "index.html");
  if (isFrontendDetected && fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.status(200).send("Beereddy Agency ERP Backend API is running. Frontend build not present.");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================");
  console.log("🚀 Server started successfully!");
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`💻 Host: 0.0.0.0`);
  console.log(`🎨 Frontend: ${isFrontendDetected ? `Detected (${frontendDistPath})` : `WARNING: Missing build at (${frontendDistPath})`}`);
  console.log(`🗄️ Mongo Status: ${isMongoConnected ? "Connected" : "Connecting..."}`);
  console.log("==========================================");
});