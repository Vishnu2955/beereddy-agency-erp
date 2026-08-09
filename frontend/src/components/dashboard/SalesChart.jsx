import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FaChartLine } from "react-icons/fa";
import dashboardService from "../../services/dashboardService";

const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
        <p className="font-bold border-b border-slate-700 pb-1">{label}</p>
        <p className="text-emerald-400 font-semibold">
          Sales: ₹{Number(payload[0].value || 0).toLocaleString("en-IN")}
        </p>
        {payload[0].payload.orders && (
          <p className="text-slate-300">
            Orders: {payload[0].payload.orders}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function SalesChart() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await dashboardService.getMonthlySales();

      const formatted = data.map((item) => ({
        month: `${monthNames[item._id.month]} ${item._id.year}`,
        sales: item.totalSales,
        orders: item.totalOrders,
      }));

      setSales(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col items-center justify-center h-80">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-bold mt-3">Loading Sales Analytics...</span>
      </div>
    );
  }

  return (
    <div className="dynamic-card-3d bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg border border-indigo-100 shadow-sm">
            <FaChartLine />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Monthly Sales Performance
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Revenue trends across billing cycles</p>
          </div>
        </div>

        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-sm">
          Monthly View
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" fill="url(#salesGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}