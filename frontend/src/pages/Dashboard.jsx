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
} from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const isRetailer = currentUser?.role === "retailer";

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    totalProducts: 0,
    totalRetailers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalSales: 0,
    outstandingAmount: 0,
  });

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDashboard(res.data.dashboard || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider animate-pulse">
          Initializing ERP Workspace...
        </h2>
      </div>
    );
  }

  // ===============================================
  // RETAILER B2B PROCUREMENT DASHBOARD
  // ===============================================
  if (isRetailer) {
    return (
      <div className="space-y-8">
        
        {/* Retailer Hero Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                B2B Retailer Partner Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">• Beereddy Agency</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{currentUser?.shopName || currentUser?.fullName || "Valued Partner"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Manage product inventory orders, monitor real-time order delivery status, review account invoices, and settle outstanding balances instantly.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/products")}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <FaShoppingBag /> Place New Order
            </button>
            <button
              onClick={() => navigate("/payments")}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <FaCreditCard /> Pay Dues Online
            </button>
          </div>
        </div>

        {/* Retailer KPI Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Orders Placed"
            value={dashboard.totalOrders}
            icon={<FaClipboardList />}
            trend="+100% Active"
            trendUp={true}
            color="from-blue-600 to-indigo-700"
            subtitle="Total registered orders"
            onClick={() => navigate("/orders")}
          />

          <StatCard
            title="Pending & In-Transit"
            value={dashboard.pendingOrders}
            icon={<FaClock />}
            trend={dashboard.pendingOrders > 0 ? "Requires tracking" : "All cleared"}
            trendUp={dashboard.pendingOrders === 0}
            color="from-amber-500 to-orange-600"
            subtitle="Orders processing"
            onClick={() => navigate("/orders")}
          />

          <StatCard
            title="Total Purchase Value"
            value={`₹${(dashboard.totalSales || 0).toLocaleString("en-IN")}`}
            icon={<FaMoneyBillWave />}
            trend="+15.8% YTD"
            trendUp={true}
            color="from-emerald-600 to-teal-700"
            subtitle="Gross order volume"
            onClick={() => navigate("/orders")}
          />

          <StatCard
            title="Outstanding Dues"
            value={`₹${(dashboard.outstandingAmount || 0).toLocaleString("en-IN")}`}
            icon={<FaExclamationTriangle />}
            trend={dashboard.outstandingAmount > 0 ? "Payment Due" : "Clear Account"}
            trendUp={dashboard.outstandingAmount === 0}
            color="from-rose-600 to-red-700"
            subtitle="Current payable balance"
            onClick={() => navigate("/payments")}
          />
        </div>

        {/* Quick Navigation Cards Hub */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Retailer Operations Hub</h2>
            <span className="text-xs text-slate-400 font-semibold">Quick Shortcuts</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-100/90 text-blue-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <FaBoxOpen />
              </div>
              <span className="font-extrabold text-xs text-slate-800">Browse Catalog</span>
              <span className="text-[11px] text-blue-600 font-medium">Order items & 3D view</span>
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="p-5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-100/90 text-amber-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <FaClipboardList />
              </div>
              <span className="font-extrabold text-xs text-slate-800">My Orders</span>
              <span className="text-[11px] text-amber-600 font-medium">Track delivery progress</span>
            </button>

            <button
              onClick={() => navigate("/invoices")}
              className="p-5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100/90 text-purple-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <FaFileInvoice />
              </div>
              <span className="font-extrabold text-xs text-slate-800">Invoices & PDF</span>
              <span className="text-[11px] text-purple-600 font-medium">Download tax invoices</span>
            </button>

            <button
              onClick={() => navigate("/payments")}
              className="p-5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100/90 text-emerald-900 transition flex flex-col items-center text-center space-y-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                <FaCreditCard />
              </div>
              <span className="font-extrabold text-xs text-slate-800">Payment Gateway</span>
              <span className="text-[11px] text-emerald-600 font-medium">Pay via UPI & Cards</span>
            </button>
          </div>
        </div>

        {/* Order Status Chart & Recent Orders */}
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
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider">
              Central Distributor Executive Suite
            </span>
            <span className="text-xs text-slate-400 font-medium">• V Bond Agency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Distributor <span className="text-indigo-400">Control Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Overview of total distribution revenue, inventory stock levels, active retailer partners, and pending fulfillment orders across the network.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/products")}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <FaPlus /> Add New Product
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <FaFileDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Catalog Products"
          value={dashboard.totalProducts}
          icon={<FaBoxOpen />}
          trend="+8 Active"
          trendUp={true}
          color="from-blue-600 to-indigo-700"
          subtitle="Listed in inventory"
          onClick={() => navigate("/products")}
        />

        <StatCard
          title="Registered Retailers"
          value={dashboard.totalRetailers}
          icon={<FaStore />}
          trend="+14% MoM"
          trendUp={true}
          color="from-emerald-600 to-teal-700"
          subtitle="Verified agency accounts"
          onClick={() => navigate("/retailers")}
        />

        <StatCard
          title="Total Network Orders"
          value={dashboard.totalOrders}
          icon={<FaClipboardList />}
          trend="+22.4% MoM"
          trendUp={true}
          color="from-orange-500 to-amber-600"
          subtitle="Fulfilled & active orders"
          onClick={() => navigate("/orders")}
        />

        <StatCard
          title="Total Agency Sales Revenue"
          value={`₹${(dashboard.totalSales || 0).toLocaleString("en-IN")}`}
          icon={<FaMoneyBillWave />}
          trend="+18.5% YTD"
          trendUp={true}
          color="from-purple-600 to-indigo-800"
          subtitle="Gross sales turnover"
          onClick={() => navigate("/invoices")}
        />

        <StatCard
          title="Pending Order Approvals"
          value={dashboard.pendingOrders}
          icon={<FaClock />}
          trend={dashboard.pendingOrders > 0 ? "Action Required" : "All cleared"}
          trendUp={dashboard.pendingOrders === 0}
          color="from-yellow-500 to-amber-600"
          subtitle="Awaiting dispatch"
          onClick={() => navigate("/orders")}
        />

        <StatCard
          title="Low Stock Inventory Alerts"
          value={dashboard.lowStockProducts}
          icon={<FaExclamationTriangle />}
          trend={dashboard.lowStockProducts > 0 ? "Restock Needed" : "Optimal Stock"}
          trendUp={dashboard.lowStockProducts === 0}
          color="from-rose-600 to-red-700"
          subtitle="Below reorder threshold"
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