import {
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaShoppingCart,
  FaCube,
  FaEye,
} from "react-icons/fa";

const IMAGE_URL = "/uploads/products/";

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onAddToCart,
  onView3D,
}) {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "admin";

  if (!products.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-16 text-center">
        <FaBoxOpen className="mx-auto text-5xl text-slate-300 mb-3" />
        <h3 className="text-xl font-bold text-slate-800">No Products Available</h3>
        <p className="text-slate-500 text-xs mt-1">Add your first product to start managing inventory catalog.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Item</th>
              <th className="px-5 py-4">Product Info</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">SKU / Code</th>
              <th className="px-5 py-4 text-right">MRP</th>
              <th className="px-5 py-4 text-right">Selling Price</th>
              <th className="px-5 py-4 text-center">Stock Level</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {products.map((product) => {
              const isLowStock = product.stock <= (product.minimumStock || 10);
              const isOutOfStock = product.stock <= 0;

              return (
                <tr key={product._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    {product.image ? (
                      <img
                        src={product.image.startsWith("http") ? product.image : `${IMAGE_URL}${product.image}`}
                        alt={product.productName}
                        className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <FaBoxOpen className="text-lg" />
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-extrabold text-slate-800 text-sm leading-snug">{product.productName}</p>
                    {product.brand && (
                      <span className="text-[11px] font-medium text-slate-400">Brand: {product.brand}</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
                      {product.category || "General"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                    {product.sku || "-"}
                  </td>

                  <td className="px-5 py-3.5 text-right font-medium text-slate-400 line-through">
                    ₹{Number(product.mrp || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-3.5 text-right font-extrabold text-emerald-700 text-sm">
                    ₹{Number(product.sellingPrice || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-3.5 text-center font-extrabold text-slate-800">
                    {product.stock} {product.unit || "PCS"}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      isOutOfStock
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : isLowStock
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView3D && onView3D(product)}
                        className="bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-indigo-200 shadow-2xs"
                        title="360° / 3D Interactive Viewer"
                      >
                        <FaCube className="text-sm" />
                      </button>

                      {role === "admin" && (
                        <>
                          <button
                            onClick={() => onOpenMedia && onOpenMedia(product)}
                            className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-purple-200 shadow-2xs"
                            title="Product Media & 360° Manager"
                          >
                            <FaEye className="text-sm" />
                          </button>

                          <button
                            onClick={() => onEdit(product)}
                            className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-blue-200 shadow-2xs"
                            title="Edit Product"
                          >
                            <FaEdit className="text-sm" />
                          </button>

                          <button
                            onClick={() => onDelete(product)}
                            className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition w-8 h-8 rounded-xl flex items-center justify-center border border-rose-200 shadow-2xs"
                            title="Delete Product"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </>
                      )}

                      {role === "retailer" && (
                        <button
                          onClick={() => onAddToCart(product)}
                          disabled={isOutOfStock}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm disabled:opacity-50"
                        >
                          <FaShoppingCart /> Add
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}