import { useEffect, useState } from "react";
import { FaClipboardList, FaStore, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../services/dashboardService";

export default function RecentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await dashboardService.getRecentOrders();
      setOrders(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg border border-amber-100">
            <FaClipboardList />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800">
              Recent Agency Orders
            </h2>
            <p className="text-xs text-slate-400 font-medium">Latest incoming retailer transactions</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
        >
          View All <FaArrowRight className="text-[10px]" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] text-left">
              <th className="py-3 px-2">Retailer Shop</th>
              <th className="py-3 px-2 text-right">Order Amount</th>
              <th className="py-3 px-2 text-center">Fulfillment</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                  No recent orders registered.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const shopName = order.retailer?.shopName || "Retailer Partner";
                const initial = shopName.substring(0, 1).toUpperCase();
                const status = order.orderStatus || order.status || "Pending";

                return (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-extrabold text-[11px] border border-slate-200">
                          {initial}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{shopName}</p>
                          <p className="text-[10px] text-slate-400">
                            {order.invoiceNumber ? `#${order.invoiceNumber}` : "Invoice Pending"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-right font-extrabold text-slate-900">
                      ₹{Number(order.totalAmount || order.finalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        status === "Delivered" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : status === "Cancelled"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : status === "Shipped"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}