import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaArrowRight, FaBox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../services/dashboardService";

export default function LowStockTable() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await dashboardService.getLowStockProducts();
      setProducts(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dynamic-card-3d bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg border border-rose-100 shadow-sm">
            <FaExclamationTriangle />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Low Stock Alerts
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Items near or below minimum stock level</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/inventory")}
          className="text-xs font-black text-rose-600 hover:text-rose-800 flex items-center gap-1 transition"
        >
          Manage Inventory <FaArrowRight className="text-[10px]" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider text-[10px] text-left">
              <th className="py-3 px-2">Product Name</th>
              <th className="py-3 px-2 text-center">Current Stock</th>
              <th className="py-3 px-2 text-center">Min Threshold</th>
              <th className="py-3 px-2 text-right">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                  All inventory stock levels are healthy!
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const pName = product.productName || product.name || "Item";
                const stock = product.stock || 0;
                const minStock = product.minimumStock || 10;
                const isCritical = stock === 0;

                return (
                  <tr key={product._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                      <FaBox className="text-slate-400 text-xs" />
                      {pName}
                    </td>

                    <td className="py-3 px-2 text-center">
                      <span className={`font-extrabold ${isCritical ? "text-rose-600" : "text-amber-600"}`}>
                        {stock} {product.unit || "PCS"}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center text-slate-500 font-medium">
                      {minStock} {product.unit || "PCS"}
                    </td>

                    <td className="py-3 px-2 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}>
                        {isCritical ? "Out of Stock" : "Low Stock"}
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