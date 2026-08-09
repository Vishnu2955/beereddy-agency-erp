import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTimes,
  FaBoxOpen,
  FaClipboardList,
  FaFileInvoice,
  FaCreditCard,
  FaStore,
  FaArrowRight,
} from "react-icons/fa";
import api from "../../services/api";
import { getUser } from "../../utils/auth";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = getUser();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    products: [],
    orders: [],
    payments: [],
    retailers: [],
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ products: [], orders: [], payments: [], retailers: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ products: [], orders: [], payments: [], retailers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, ordRes, payRes, retRes] = await Promise.allSettled([
          api.get(`/products?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/orders?search=${encodeURIComponent(query)}`),
          api.get(`/payments`),
          user?.role === "admin" ? api.get(`/retailers`) : Promise.resolve({ data: {} }),
        ]);

        const products = prodRes.status === "fulfilled" ? (prodRes.value.data.products || []).slice(0, 5) : [];
        const rawOrders = ordRes.status === "fulfilled" ? (ordRes.value.data.orders || []) : [];
        const filteredOrders = rawOrders
          .filter(
            (o) =>
              (o.invoiceNumber || "").toLowerCase().includes(query.toLowerCase()) ||
              (o.retailer?.shopName || "").toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5);

        const rawPayments = payRes.status === "fulfilled" ? (payRes.value.data.payments || []) : [];
        const filteredPayments = rawPayments
          .filter(
            (p) =>
              (p.referenceNumber || "").toLowerCase().includes(query.toLowerCase()) ||
              (p.order?.invoiceNumber || "").toLowerCase().includes(query.toLowerCase()) ||
              (p.retailer?.shopName || "").toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5);

        const rawRetailers = retRes.status === "fulfilled" ? (retRes.value.data.retailers || []) : [];
        const filteredRetailers = rawRetailers
          .filter(
            (r) =>
              (r.shopName || "").toLowerCase().includes(query.toLowerCase()) ||
              (r.fullName || "").toLowerCase().includes(query.toLowerCase()) ||
              (r.phone || "").includes(query)
          )
          .slice(0, 5);

        setResults({
          products,
          orders: filteredOrders,
          payments: filteredPayments,
          retailers: filteredRetailers,
        });
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, user?.role]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  const totalResults =
    results.products.length +
    results.orders.length +
    results.payments.length +
    results.retailers.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <FaSearch className="text-blue-600 text-lg shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search orders, invoices, products, payments, retailers... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 bg-slate-200 rounded-md">
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <FaTimes />
          </button>
        </div>

        {/* Search Results Container */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="p-8 text-center text-xs font-bold text-blue-600 animate-pulse">
              Searching ERP Records...
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <p className="font-semibold">Type a keyword or number to search instantly</p>
              <div className="flex justify-center gap-2 flex-wrap text-[11px]">
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-mono">Invoice #</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">Product Name</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">Retailer Shop</span>
              </div>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No ERP records found matching "{query}"
            </div>
          )}

          {/* Products Results */}
          {results.products.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-2">Products ({results.products.length})</span>
              <div className="space-y-1">
                {results.products.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelect("/products")}
                    className="w-full p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <FaBoxOpen />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white group-hover:text-blue-600">{p.productName}</h4>
                        <span className="text-[10px] text-slate-400">{p.category || "Adhesives"} • Stock: {p.stock}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-600">₹{Number(p.sellingPrice || 0).toLocaleString("en-IN")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders & Invoices Results */}
          {results.orders.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-2">Orders & Invoices ({results.orders.length})</span>
              <div className="space-y-1">
                {results.orders.map((o) => (
                  <button
                    key={o._id}
                    onClick={() => handleSelect(`/invoice/${o._id}`)}
                    className="w-full p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <FaFileInvoice />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white group-hover:text-indigo-600">
                          {o.invoiceNumber ? `Invoice #${o.invoiceNumber}` : "Order Pending"}
                        </h4>
                        <span className="text-[10px] text-slate-400">{o.retailer?.shopName || "Retailer Partner"}</span>
                      </div>
                    </div>
                    <FaArrowRight className="text-xs text-slate-400 group-hover:text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payments Results */}
          {results.payments.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-2">Payments ({results.payments.length})</span>
              <div className="space-y-1">
                {results.payments.map((pay) => (
                  <button
                    key={pay._id}
                    onClick={() => handleSelect("/payments")}
                    className="w-full p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <FaCreditCard />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600">
                          Payment #{pay.referenceNumber || pay._id.slice(-6)}
                        </h4>
                        <span className="text-[10px] text-slate-400">{pay.paymentMethod} • {pay.status || "Pending"}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-emerald-600">₹{Number(pay.amount || 0).toLocaleString("en-IN")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Retailers Results */}
          {results.retailers.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2 px-2">Retailer Partners ({results.retailers.length})</span>
              <div className="space-y-1">
                {results.retailers.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => handleSelect("/retailers")}
                    className="w-full p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <FaStore />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white group-hover:text-purple-600">{r.shopName}</h4>
                        <span className="text-[10px] text-slate-400">{r.fullName} • {r.city || r.phone}</span>
                      </div>
                    </div>
                    <FaArrowRight className="text-xs text-slate-400 group-hover:text-purple-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-[11px] text-slate-400 font-medium">
          Press <kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">Esc</kbd> to exit search window
        </div>
      </div>
    </div>
  );
}
