import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StatCard from "../components/StatCard";
import OrderStatusChart from "../components/dashboard/OrderStatusChart";
import SalesChart from "../components/dashboard/SalesChart";
import RecentOrders from "../components/dashboard/RecentOrders";
import LowStockTable from "../components/dashboard/LowStockTable";
import TopProducts from "../components/dashboard/TopProducts";
import { getUser } from "../utils/auth";
import { usePwa } from "../context/PwaContext";
import {
  FaBoxOpen,
  FaStore,
  FaClipboardList,
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle,
  FaShoppingBag,
  FaFileInvoice,
  FaCreditCard,
  FaArrowRight,
  FaShieldAlt,
  FaChartLine,
  FaPlus,
  FaFileDownload,
  FaDownload,
  FaLayerGroup,
  FaSyncAlt,
  FaBoxes,
} from "react-icons/fa";

import SkeletonLoader from "../components/common/SkeletonLoader";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const isRetailer = currentUser?.role === "retailer";
  const { isInstallable, promptInstall } = usePwa();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    todaySales: 0,
    monthlySales: 0,
    totalSales: 0,
    totalProducts: 0,
    totalRetailers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    outstandingAmount: 0,
    pendingPayments: 0,
  });

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDashboard(res.data?.dashboard || res.data || {});
    } catch (err) {
      console.error("[Dashboard] Error loading dashboard stats:", err);
    } fontFinally: {
      setLoading(false);
    }
  };

  const { refreshing, pullDistance } = usePullToRefresh(loadDashboard);

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-slate-900/90 rounded-3xl animate-pulse" />
        <SkeletonLoader type="stats" count={4} />
        <SkeletonLoader type="table" count={3} />
      </div>
    );
  }

  // Safe Formatter Helpers
  const formatCurrency = (amount) => {
    const val = Number(amount) || 0;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // ===============================================
  // RETAILER PARTNER DASHBOARD
  // ===============================================
  if (isRetailer) {
    return (
      <div className="space-y-8">
        
        {/* Soft Modern Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                Authorized Retailer Partner
              </span>
              <span className="text-xs text-slate-400 font-medium">• BEEREDDY AGENCY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-emerald-400">{currentUser?.shopName || currentUser?.fullName || "Valued Retailer"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Order genuine V-Bond tile adhesives, track active delivery dispatches, download GST invoices, and manage your account dues softly and securely.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {isInstallable && (
              <button
                onClick={promptInstall}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <FaDownload /> Install App
              </button>
            )}
            <button
              onClick={() => navigate("/products")}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <FaShoppingBag /> Place New Order
            </button>
          </div>
        </div>

        {/* Retailer Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={dashboard.totalOrders || 0}
            icon={<FaClipboardList />}
            trend="Active Network"
            trendUp={true}
            color="from-blue-600 to-indigo-700"
            subtitle="Registered purchase orders"
            onClick={() => navigate("/orders")}
          />

          <StatCard
            title="Pending & In-Transit"
            value={dashboard.pendingOrders || 0}
            icon={<FaClock />}
            trend={dashboard.pendingOrders > 0 ? "Dispatch Active" : "All Delivered"}
            trendUp={dashboard.pendingOrders === 0}
            color="from-amber-500 to-orange-600"
            subtitle="Orders processing"
            onClick={() => navigate("/orders")}
          />

          <StatCard
            title="Total Purchase Value"
            value={formatCurrency(dashboard.totalSales)}
            icon={<FaMoneyBillWave />}
            trend="Gross Volume"
            trendUp={true}
            color="from-emerald-600 to-teal-700"
            subtitle="Fulfilled orders value"
            onClick={() => navigate("/orders")}
          />

          <StatCard
            title="Outstanding Dues"
            value={formatCurrency(dashboard.outstandingAmount)}
            icon={<FaExclamationTriangle />}
            trend={dashboard.outstandingAmount > 0 ? "Due Clear Needed" : "Account Clear"}
            trendUp={dashboard.outstandingAmount === 0}
            color="from-rose-600 to-red-700"
            subtitle="Current balance payable"
            onClick={() => navigate("/payments")}
          />
        </div>

        {/* Quick Operational Shortcuts Hub */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Retailer Operations Hub</h2>
            <span className="text-xs text-slate-500 font-semibold">1-Tap Shortcuts</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 text-blue-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                <FaBoxOpen />
              </div>
              <span className="font-extrabold text-xs text-slate-800">Order Catalog</span>
              <span className="text-[10px] text-blue-600 font-medium">Browse V-Bond products</span>
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="p-5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 text-amber-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                <FaClipboardList />
              </div>
              <span className="font-extrabold text-xs text-slate-800">Order History</span>
              <span className="text-[10px] text-amber-600 font-medium">Track delivery status</span>
            </button>

            <button
              onClick={() => navigate("/invoices")}
              className="p-5 rounded-2xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-100 text-purple-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                <FaFileInvoice />
              </div>
              <span className="font-extrabold text-xs text-slate-800">GST Invoices</span>
              <span className="text-[10px] text-purple-600 font-medium">Download tax bills</span>
            </button>

            <button
              onClick={() => navigate("/payments")}
              className="p-5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                <FaCreditCard />
              </div>
              <span className="font-extrabold text-xs text-slate-800">Pay Online</span>
              <span className="text-[10px] text-emerald-600 font-medium">Clear dues via UPI/Cards</span>
            </button>
          </div>
        </div>

        {/* Charts & Order Status */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OrderStatusChart />
          </div>
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
        </div>

      </div>
    );
  }

  // ===============================================
  // ADMIN AGENCY DISTRIBUTOR CONTROL CENTER
  // ===============================================
  return (
    <div className="space-y-8">

      {/* Admin Executive Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest">
              Executive Distributor Command Suite
            </span>
            <span className="text-xs text-slate-400 font-medium">• BEEREDDY AGENCY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Distributor <span className="text-amber-400">Control Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor real-time network sales turnover, stock inventory reorder alerts, retailer accounts, and pending order dispatches softly and efficiently.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/products")}
            className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-5 py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <FaPlus /> Add Product
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-extrabold px-5 py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <FaFileDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(dashboard.todaySales)}
          icon={<FaMoneyBillWave />}
          trend={dashboard.todaySales > 0 ? "Daily Active" : "₹0 Today"}
          trendUp={dashboard.todaySales > 0}
          color="from-blue-600 to-indigo-700"
          subtitle="Orders recorded today"
          onClick={() => navigate("/orders")}
        />

        <StatCard
          title="Monthly Sales"
          value={formatCurrency(dashboard.monthlySales)}
          icon={<FaChartLine />}
          trend={dashboard.monthlySales > 0 ? "Month Active" : "₹0 Month"}
          trendUp={dashboard.monthlySales > 0}
          color="from-indigo-600 to-purple-700"
          subtitle="Current month turnover"
          onClick={() => navigate("/reports")}
        />

        <StatCard
          title="Outstanding Credit"
          value={formatCurrency(dashboard.outstandingAmount)}
          icon={<FaExclamationTriangle />}
          trend={dashboard.outstandingAmount > 0 ? "Due Outstanding" : "Clean Dues"}
          trendUp={dashboard.outstandingAmount === 0}
          color="from-rose-600 to-red-700"
          subtitle="Total pending dues"
          onClick={() => navigate("/outstanding")}
        />

        <StatCard
          title="Pending Payments"
          value={dashboard.pendingPayments || 0}
          icon={<FaClock />}
          trend={dashboard.pendingPayments > 0 ? "Action Required" : "Zero Pending"}
          trendUp={dashboard.pendingPayments === 0}
          color="from-amber-500 to-orange-600"
          subtitle="Unsettled invoices"
          onClick={() => navigate("/payments")}
        />

        <StatCard
          title="Catalog Products"
          value={dashboard.totalProducts || 0}
          icon={<FaBoxOpen />}
          trend={dashboard.totalProducts > 0 ? `+${dashboard.totalProducts} Listed` : "Empty Catalog"}
          trendUp={dashboard.totalProducts > 0}
          color="from-emerald-600 to-teal-700"
          subtitle="Active catalog items"
          onClick={() => navigate("/products")}
        />

        <StatCard
          title="Retailer Partners"
          value={dashboard.totalRetailers || 0}
          icon={<FaStore />}
          trend={dashboard.totalRetailers > 0 ? `+${dashboard.totalRetailers} Verified` : "No Retailers"}
          trendUp={dashboard.totalRetailers > 0}
          color="from-cyan-600 to-blue-700"
          subtitle="Authorized network buyers"
          onClick={() => navigate("/retailers")}
        />

        <StatCard
          title="Total Customers"
          value={dashboard.totalCustomers || dashboard.totalRetailers || 0}
          icon={<FaShieldAlt />}
          trend="Registered Base"
          trendUp={true}
          color="from-violet-600 to-indigo-800"
          subtitle="Registered customer base"
          onClick={() => navigate("/retailers")}
        />

        <StatCard
          title="Low Stock Alerts"
          value={dashboard.lowStockProducts || 0}
          icon={<FaExclamationTriangle />}
          trend={dashboard.lowStockProducts > 0 ? "Reorder Limit" : "Optimal Stock"}
          trendUp={dashboard.lowStockProducts === 0}
          color="from-rose-600 to-red-700"
          subtitle="Items below safety limit"
          onClick={() => navigate("/inventory")}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart />
        <OrderStatusChart />
      </div>

      {/* Low Stock & Recent Orders Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LowStockTable />
        <RecentOrders />
      </div>

      {/* Top Products Analytics */}
      <TopProducts />
    </div>
  );
}