# API Endpoint Reference - Beereddy Agency ERP Version 1.0.0

Base URL: `http://localhost:5000/api`

---

## 🔑 1. Authentication & Security Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new retailer account | Admin Only |
| `POST` | `/api/auth/login` | Login user (Email or Phone) | Public (Rate-limited) |
| `POST` | `/api/auth/forgot-password` | Send OTP for password reset | Public |
| `POST` | `/api/auth/verify-otp` | Verify password reset OTP | Public |
| `POST` | `/api/auth/reset-password` | Set new password | Public |

---

## 📦 2. Products Catalog Routes (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/products` | Get products list (Paginated + Search) | User |
| `POST` | `/api/products` | Add new product | Admin |
| `PUT` | `/api/products/:id` | Update product details | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

---

## 📋 3. Orders & Fulfillment Routes (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/orders` | Get orders list (Filter by status, date) | User |
| `POST` | `/api/orders` | Place new order & trigger WhatsApp alert | User |
| `PUT` | `/api/orders/:id/status` | Update order status (Pending/Approved/Delivered) | Admin |
| `DELETE` | `/api/orders/:id` | Cancel/Delete order | Admin |

---

## 📄 4. Invoices & Payments Routes (`/api/invoices`, `/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/invoices` | List tax invoices | User |
| `GET` | `/api/invoices/:id` | Get single invoice details | User |
| `POST` | `/api/payments` | Record payment entry | Admin |
| `GET` | `/api/outstanding` | View retailer outstanding balances | Admin |

---

## ⚙️ 5. System, Security & Diagnostics Routes (`/api/system`, `/api/security`, `/api/diagnostics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Application health check endpoint | Public |
| `GET` | `/api/system/status` | Infrastructure status & memory metrics | Admin |
| `PUT` | `/api/system/maintenance` | Toggle System Maintenance Mode | Admin |
| `GET` | `/api/security/stats` | Security dashboard counters & logs | Admin |
| `GET` | `/api/security/settings` | Security policy settings | Admin |
| `GET` | `/api/diagnostics/run-check` | Execute 8-Step System Self-Check | Admin |
| `GET` | `/api/diagnostics/bugs` | List captured internal bug reports | Admin |
| `POST` | `/api/backup/create` | Generate encrypted DB snapshot backup | Admin |
| `POST` | `/api/backup/restore` | Restore database snapshot | Admin |
