import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Retailers from "./pages/Retailers";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Invoice from "./pages/Invoice";
import Payments from "./pages/Payments";
import Outstanding from "./pages/Outstanding";
import Inventory from "./pages/Inventory";
import AuditLogs from "./pages/AuditLogs";
import Analytics from "./pages/Analytics";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import SecurityDashboard from "./pages/SecurityDashboard";
import SecuritySettings from "./pages/SecuritySettings";
import MobileSettings from "./pages/MobileSettings";
import SystemStatus from "./pages/SystemStatus";
import About from "./pages/About";
import SystemDiagnostics from "./pages/SystemDiagnostics";
import CompanyProfile from "./pages/CompanyProfile";
import Categories from "./pages/Categories";
import BackupRestore from "./pages/BackupRestore";


import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* Protected ERP Routes */}
        <Route element={<ProtectedRoute />}> 
          <Route element={<AdminLayout />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/backup-restore" element={<BackupRestore />} />
            <Route path="/retailers" element={<Retailers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/notifications/whatsapp" element={<Settings />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/outstanding" element={<Outstanding />} />
            <Route path="/outstanding/:id" element={<Outstanding />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/security-dashboard" element={<SecurityDashboard />} />
            <Route path="/security-settings" element={<SecuritySettings />} />
            <Route path="/mobile-settings" element={<MobileSettings />} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="/system-diagnostics" element={<SystemDiagnostics />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;