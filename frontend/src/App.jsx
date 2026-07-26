import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
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
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";


import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
  />
  <Route path="/verify-otp" element={<VerifyOtp />} />
<Route path="/reset-password" element={<ResetPassword />} />


        {/* Protected ERP Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/retailers" element={<Retailers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/outstanding" element={<Outstanding />} />
          <Route path="/inventory" element={<Inventory />} />

        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;