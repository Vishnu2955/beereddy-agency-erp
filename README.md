# Beereddy Agency ERP - Version 1.0.0 (Official Production Release)

Executive Distributor & Retailer Management System for **V-Bond Tile Adhesives & Construction Chemicals**.

---

## 🌟 Key Features

### 👨‍💼 Single Admin Executive Command Center
- Full catalog management for V-Bond Tile Adhesives, mortars, and grouts.
- Real-time stock deduction, inventory reorder alerts, and low-stock indicators.
- Retailer account management, credit limit tracking, and payment ledger accounting.

### 📱 Retailer Portal & PWA
- Simple product ordering with manual unit input + step buttons.
- Real-time order status tracking and tax invoice downloads.
- Cross-platform installable Progressive Web App (PWA) supporting Android, iOS Safari, Windows, and macOS.

### 💬 Automated WhatsApp & Notification Engine
- Direct WhatsApp alerts to Admin (`+916302039120`) whenever a retailer places an order.
- In-app notification bell notifications for all critical order events.
- WhatsApp test message generator and deep-linking integration.

### 🛡️ Enterprise Security & Lockout Policy
- 5-attempt failed login lockout policy (15-minute temporary lockout).
- Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, XSS Filtering).
- NoSQL Injection and XSS input sanitization middleware.
- Automated daily encrypted database snapshot backups (`uploads/backups/`).

### 🩺 8-Step System Self-Check & Diagnostics Engine
- One-click automated self-check verifying DB, Storage, Auth, WhatsApp, Backups, Data Integrity, PWA, and Exports.
- Internal exception catcher and bug tracking resolution dashboard.
- API latency and slow request monitoring.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite 8, TailwindCSS, React Router v7, React Icons, PWA Service Worker
- **Backend**: Node.js v24, Express 5, Mongoose 9, JWT Authentication, Bcrypt Hashing, Multer File Filter
- **Database**: MongoDB Atlas Cloud Cluster
- **Mobile**: Flutter 3.27 Release APK (`beereddy_mobile_release.apk`)

---

## 💻 Local Running & Development

### 1. Backend Server:
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000` (Host `0.0.0.0` enabled).

### 2. Frontend Application:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 📄 Production Documentation

- [DEPLOYMENT_GUIDE.md](file:///c:/Users/DELL/OneDrive/Desktop/BEEREDDYAGENCY/DEPLOYMENT_GUIDE.md) - Production deployment guide for Vercel, Render, Railway, DigitalOcean, and Docker.
- [API_DOCUMENTATION.md](file:///c:/Users/DELL/OneDrive/Desktop/BEEREDDYAGENCY/API_DOCUMENTATION.md) - Complete REST API endpoint reference.
