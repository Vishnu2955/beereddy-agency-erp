import { useEffect, useState } from "react";
import api from "../services/api";
import { errorToast } from "../utils/toast";
import {
  FaChartLine,
  FaRupeeSign,
  FaShoppingCart,
  FaUsers,
  FaBoxes,
  FaFileInvoiceDollar,
  FaSync,
  FaArrowUp,
  FaCheckCircle,
} from "react-icons/fa";

export default function Analytics() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalRetailers: 0,
    inventoryValue: 0,
    totalOutstanding: 0,
    averageOrderValue: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, salesRes, finRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/sales"),
        api.get("/analytics/finance"),
      ]);

      if (dashRes.data?.metrics) setMetrics(dashRes.data.metrics);
      if (salesRes.data?.monthlySales) setSalesData(salesRes.data.monthlySales);
      if (salesRes.data?.topProducts) setTopProducts(salesRes.data.topProducts);
      if (finRes.data?.paymentTrends) setFinanceData(finRes.data.paymentTrends);
    } catch (err) {
      console.error("Load Analytics Error:", err);
      errorToast("Failed to load Business Intelligence metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold">Loading Business Intelligence & Analytics Engine...</div>;
  }

  return (
    <div className="container-fluid p-4 space-y-6">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Enterprise Business Intelligence</h1>
            <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
              <FaChartLine /> AGGREGATED METRICS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenue growth, top-selling products, inventory asset turnover & payment channel distribution
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl transition text-xs flex items-center gap-2 shadow cursor-pointer uppercase"
        >
          <FaSync /> Refresh BI Engine
        </button>
      </div>

      {/* BI KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-extrabold text-emerald-100">Approved Net Revenue</span>
            <h3 className="text-2xl font-black mt-1">₹{metrics.totalRevenue.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-emerald-200 mt-1 flex items-center gap-1">
              <FaArrowUp /> Verified Bank & Cash Payments
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-emerald-100">
            <FaRupeeSign />
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-extrabold text-blue-100">Total Approved Orders</span>
            <h3 className="text-2xl font-black mt-1">{metrics.totalOrders.toLocaleString("en-IN")} <span className="text-xs font-bold text-blue-200">Orders</span></h3>
            <p className="text-[10px] text-blue-200 mt-1">
              Average Order Value: <strong className="text-white font-bold">₹{metrics.averageOrderValue.toLocaleString("en-IN")}</strong>
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-blue-100">
            <FaShoppingCart />
          </div>
        </div>

        {/* Inventory Stock Value */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-extrabold text-slate-400">Total Inventory Stock Asset</span>
            <h3 className="text-2xl font-black mt-1">₹{metrics.inventoryValue.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-slate-300 mt-1">
              {metrics.totalRetailers} Active Retailer Stores
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-amber-400">
            <FaBoxes />
          </div>
        </div>

      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <FaCheckCircle className="text-emerald-600" /> Top Selling V-Bond Tile Adhesive Products
          </span>
          <span className="text-slate-400 font-mono">By Sales Revenue & Volume</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Product Name</th>
                <th className="p-4 text-right">Units Sold</th>
                <th className="p-4 text-right">Revenue Generated (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 font-bold">
                    No sales product aggregations computed yet.
                  </td>
                </tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-slate-500">#{idx + 1}</td>
                    <td className="p-4 font-extrabold text-slate-900">{p._id || "Product"}</td>
                    <td className="p-4 text-right font-mono font-bold text-blue-600 text-sm">
                      {p.quantitySold.toLocaleString("en-IN")} Units
                    </td>
                    <td className="p-4 text-right font-mono font-black text-emerald-600 text-base">
                      ₹{p.revenueGenerated.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
