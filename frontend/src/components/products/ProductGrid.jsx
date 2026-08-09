import { useState, useMemo } from "react";
import { FaShoppingCart, FaBoxOpen, FaCube, FaCheckCircle, FaExclamationCircle, FaTag } from "react-icons/fa";

const IMAGE_BASE_URL = "/uploads/products/";

export default function ProductGrid({
  products = [],
  onAddToCart,
  onView3D,
  onSelectProduct,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [quantities, setQuantities] = useState({});

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.productName || "").localeCompare(b.productName || ""));
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  const handleQtyChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const updated = current + delta;
      return { ...prev, [productId]: updated > 0 ? updated : 1 };
    });
  };

  if (!products.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-slate-200">
        <FaBoxOpen className="mx-auto text-6xl text-slate-300 mb-4" />
        <h3 className="text-2xl font-bold text-slate-800">No Products Available</h3>
        <p className="text-slate-500 mt-2">Check back later or try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filter & Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Counter & Sort Selector */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Showing <strong className="text-blue-700">{filteredProducts.length}</strong> of {products.length} Products
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-xl text-xs px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium cursor-pointer"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>

      </div>

      {/* E-Commerce Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const qty = quantities[product._id] || 1;
          const discountPct = product.mrp > product.sellingPrice
            ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
            : 0;
          const imagePath = product.image ? (product.image.startsWith("http") ? product.image : `${IMAGE_BASE_URL}${product.image}`) : null;

          return (
            <div
              key={product._id || product.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group dynamic-card-3d cursor-pointer"
              onClick={() => onSelectProduct && onSelectProduct(product)}
            >
              <div>
                {/* Image Header */}
                <div className="relative bg-slate-50 p-6 h-52 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                  {imagePath ? (
                    <img
                      src={imagePath}
                      alt={product.productName}
                      className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-bold text-xl shadow-inner">
                      {product.productName.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discountPct > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <FaTag className="text-[10px]" /> {discountPct}% OFF
                    </span>
                  )}

                  {/* Stock Status Badge */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 ${
                      product.stock > 0
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {product.stock > 0 ? (
                      <><FaCheckCircle /> In Stock</>
                    ) : (
                      <><FaExclamationCircle /> Out of Stock</>
                    )}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    {product.category || "General"}
                  </span>

                  <h3 className="font-bold text-slate-800 text-base mt-2 line-clamp-1 group-hover:text-amber-600 transition">
                    {product.productName}
                  </h3>

                  {product.brand && (
                    <p className="text-xs text-slate-400 mt-0.5">Brand: <span className="font-semibold text-slate-600">{product.brand}</span></p>
                  )}

                  {/* Pricing Box */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      ₹{Number(product.sellingPrice || 0).toLocaleString("en-IN")}
                    </span>

                    {product.mrp > product.sellingPrice && (
                      <span className="text-xs text-slate-400 line-through font-medium">
                        ₹{Number(product.mrp).toLocaleString("en-IN")}
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-medium">/ {product.unit || "PCS"}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="p-5 pt-0 space-y-3" onClick={(e) => e.stopPropagation()}>
                {/* Qty Selector & 3D Button */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-xl bg-slate-50 border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product._id, -1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold transition text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantities((prev) => ({
                          ...prev,
                          [product._id]: isNaN(val) || val < 1 ? 1 : val,
                        }));
                      }}
                      className="w-12 text-center text-xs font-bold text-slate-800 bg-white border-x border-slate-200 py-1 outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product._id, 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold transition text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onView3D && onView3D(product)}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-indigo-200"
                    title="View 3D Interactive Model"
                  >
                    <FaCube className="text-indigo-600 animate-pulse" /> 3D Preview
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    for (let i = 0; i < qty; i++) {
                      onAddToCart(product);
                    }
                  }}
                  disabled={product.stock <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 text-xs uppercase tracking-wider"
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
