import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { FaChartPie } from "react-icons/fa";
import dashboardService from "../../services/dashboardService";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Packed: "#6366f1",
  Shipped: "#8b5cf6",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

const DEFAULT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function OrderStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await dashboardService.getOrderStatus();
      setData(status || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dynamic-card-3d bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg border border-blue-100 shadow-sm">
          <FaChartPie />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Order Fulfillment Breakdown
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Real-time order stage distribution</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={4}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={STATUS_COLORS[entry.status] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              formatter={(value) => <span className="text-slate-600 font-semibold">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}