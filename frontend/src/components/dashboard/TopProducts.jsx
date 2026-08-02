import { useEffect, useState } from "react";
import { FaCrown, FaTrophy } from "react-icons/fa";
import dashboardService from "../../services/dashboardService";

export default function TopProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await dashboardService.getTopSellingProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg border border-amber-100">
          <FaTrophy />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            Top Performing Products Leaderboard
          </h2>
          <p className="text-xs text-slate-400 font-medium">Highest volume and revenue generating inventory</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] text-left">
              <th className="py-3 px-2">Rank & Product Name</th>
              <th className="py-3 px-2 text-center">Units Sold</th>
              <th className="py-3 px-2 text-right">Total Revenue</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                  No sales recorded yet.
                </td>
              </tr>
            ) : (
              products.map((product, index) => {
                const rankColor = 
                  index === 0 ? "bg-amber-100 text-amber-800 border-amber-300" :
                  index === 1 ? "bg-slate-200 text-slate-800 border-slate-300" :
                  index === 2 ? "bg-amber-700/10 text-amber-900 border-amber-700/30" :
                  "bg-slate-50 text-slate-600 border-slate-200";

                return (
                  <tr key={index} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[10px] border shadow-2xs ${rankColor}`}>
                          {index === 0 ? <FaCrown className="text-amber-600 text-[11px]" /> : `#${index + 1}`}
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {product._id || product.productName || "Product Item"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-center font-bold text-slate-700">
                      {product.totalQuantity || 0} Units
                    </td>

                    <td className="py-3.5 px-2 text-right font-extrabold text-emerald-700">
                      ₹{Number(product.totalRevenue || 0).toLocaleString("en-IN")}
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