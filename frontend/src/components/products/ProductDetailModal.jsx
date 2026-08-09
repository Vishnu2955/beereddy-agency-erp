import React, { useState, useEffect } from "react";
import { FaTimes, FaStar, FaBox, FaLayerGroup, FaCheckCircle, FaShoppingCart, FaTruck, FaShieldAlt, FaInfoCircle, FaClock } from "react-icons/fa";
import { successToast } from "../../utils/toast";

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, onOrderNow }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    onAddToCart && onAddToCart(product, qty);
    onClose();
  };

  const reviews = [
    {
      id: 1,
      name: "Srinivas Tile World",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent bonding strength for 4x2 vitrified tiles! Our civil contractors highly recommend V-Bond 311.",
    },
    {
      id: 2,
      name: "Venkateswara Hardware & Building Supplies",
      rating: 5,
      date: "1 week ago",
      comment: "Zero breakage in transport and zero tile sagging on vertical wall cladding. Top quality polymer adhesive!",
    },
    {
      id: 3,
      name: "Laxmi Enterprises (Warangal)",
      rating: 4,
      date: "2 weeks ago",
      comment: "Great open time and easy mixing with water. Very good margin for B2B retailers.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 tracking-wider">
              {product.category?.name || "V-BOND ADHESIVE"}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• SKU: {product.sku || "VB-311"}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main Info Hero Section */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            
            {/* Product Image Box */}
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[220px] group">
              <img
                src={product.image || "/images/vbond-311.png"}
                alt={product.name}
                className="max-h-48 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/vbond-311.png";
                }}
              />
              <span className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-lg">
                INSTANT FACTORY STOCK
              </span>
            </div>

            {/* Title & Pricing Box */}
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-amber-400">
                  ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 20kg Bag</span>
                {product.mrp && (
                  <span className="text-xs text-slate-500 line-through">
                    ₹{product.mrp}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-xs" />
                  ))}
                </div>
                <span className="font-bold text-white">4.9 / 5.0</span>
                <span className="text-slate-400 font-medium">(142 B2B Reviews)</span>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {product.description || "High-performance polymer-modified grey adhesive for internal & external ceramic, vitrified, marble, and mosaic tile installations."}
              </p>

              {/* Real Stock Status */}
              <div className="pt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400">
                  Available Stock: {product.stock || 450} Bags Ready for Truck Dispatch
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 border-b-2 transition cursor-pointer ${
                activeTab === "specs"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Technical Specifications & Matter
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`pb-3 border-b-2 transition cursor-pointer ${
                activeTab === "pricing"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Bulk Wholesale Tiers
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 border-b-2 transition cursor-pointer ${
                activeTab === "reviews"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Retailer Reviews (3)
            </button>
          </div>

          {/* Tab 1: Specs */}
          {activeTab === "specs" && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Polymer Grade</span>
                <p className="font-extrabold text-white">Type 2 Heavy Duty Polymer</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Coverage Sheet</span>
                <p className="font-extrabold text-white">55 - 60 sq.ft @ 3mm trowel</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Initial Setting Time</span>
                <p className="font-extrabold text-white">30 Mins (Full Cure 24 Hours)</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Shelf Life</span>
                <p className="font-extrabold text-white">12 Months (Dry Storage)</p>
              </div>
            </div>
          )}

          {/* Tab 2: Pricing Tiers */}
          {activeTab === "pricing" && (
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex justify-between items-center">
                <span className="font-bold text-slate-300">1 - 20 Bags (Standard Rate)</span>
                <span className="font-black text-white">₹{product.bulkTier1Price || product.sellingPrice || product.price || 480} / Bag</span>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 flex justify-between items-center text-amber-300">
                <span className="font-bold">21 - 100 Bags (Admin Tier 2 Bulk)</span>
                <span className="font-black text-amber-400">
                  ₹{product.bulkTier2Price || Math.round((product.sellingPrice || product.price || 480) * 0.92)} / Bag
                </span>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center text-emerald-300">
                <span className="font-bold">100+ Bulk Truck Load (Admin Tier 3 Wholesale)</span>
                <span className="font-black text-emerald-400">
                  ₹{product.bulkTier3Price || Math.round((product.sellingPrice || product.price || 480) * 0.85)} / Bag
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-white">{rev.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400 text-[10px] gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-slate-300 font-medium">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded-2xl border border-slate-700 p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) - 1))}
                className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg rounded-xl hover:bg-slate-700 transition cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) || val < 1 ? "" : val);
                }}
                onBlur={() => {
                  if (!quantity || Number(quantity) < 1) setQuantity(1);
                }}
                className="w-16 text-center text-sm font-black text-white bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-1 outline-none focus:ring-2 focus:ring-amber-500 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setQuantity((q) => (Number(q) || 0) + 1)}
                className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg rounded-xl hover:bg-slate-700 transition cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xs py-4 rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <FaShoppingCart /> Add to B2B Cart
            </button>

            <button
              onClick={() => {
                handleAddToCart();
                onOrderNow && onOrderNow();
              }}
              className="flex-1 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <FaTruck /> Order Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
