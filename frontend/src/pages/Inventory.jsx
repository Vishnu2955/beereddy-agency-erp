import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import { successToast, errorToast } from "../utils/toast";
import {
  FaBoxes,
  FaExclamationTriangle,
  FaPlus,
  FaHistory,
  FaWarehouse,
  FaSync,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaDolly,
  FaTools,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export default function Inventory() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'alerts' | 'history' | 'warehouses'
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0,
    mostSoldProduct: "N/A",
    leastSoldProduct: "N/A",
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // 'ALL' | 'LOW' | 'OUT'

  // Modal States
  const [modalType, setModalType] = useState(null); // 'purchase' | 'adjust' | 'damage' | 'transfer' | 'warehouse'
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [purchaseForm, setPurchaseForm] = useState({
    productId: "",
    warehouseId: "",
    supplier: "V Bond Factory Direct",
    invoiceNumber: "",
    purchaseQuantity: "",
    purchasePrice: "",
    batchNumber: "",
  });

  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    adjustmentType: "INCREASE",
    quantity: "",
    reason: "",
  });

  const [damageForm, setDamageForm] = useState({
    productId: "",
    quantity: "",
    reason: "",
  });

  const [transferForm, setTransferForm] = useState({
    productId: "",
    toWarehouseId: "",
    quantity: "",
    reason: "",
  });

  const [warehouseForm, setWarehouseForm] = useState({
    name: "",
    location: "",
    capacity: "10000",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, dashRes, histRes, whRes, prodRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/inventory/dashboard"),
        api.get("/inventory/history"),
        api.get("/inventory/warehouses"),
        api.get("/products"),
      ]);

      setInventory(invRes.data.inventory || []);
      if (dashRes.data?.metrics) setMetrics(dashRes.data.metrics);
      setHistory(histRes.data.history || []);
      setWarehouses(whRes.data.warehouses || []);

      const pData = prodRes.data;
      if (Array.isArray(pData)) setProducts(pData);
      else if (Array.isArray(pData.products)) setProducts(pData.products);
      else if (Array.isArray(pData.data)) setProducts(pData.data);
    } catch (err) {
      console.error("Load Inventory Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const pName = item.product?.productName || "";
      const pSku = item.product?.sku || "";
      const pBrand = item.product?.brand || "";
      const bNo = item.batchNumber || "";
      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        pSku.toLowerCase().includes(search.toLowerCase()) ||
        pBrand.toLowerCase().includes(search.toLowerCase()) ||
        bNo.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === "LOW") return item.availableStock <= item.minimumStock && item.currentStock > 0;
      if (filterType === "OUT") return item.currentStock === 0;
      if (filterType === "ALERTS_ALL") return item.availableStock <= item.minimumStock || item.currentStock === 0;

      return true;
    });
  }, [inventory, search, filterType]);

  // Handlers
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/inventory/purchase", purchaseForm);
      successToast("⚡ Stock purchase entry recorded successfully!");
      setModalType(null);
      setPurchaseForm({
        productId: "",
        warehouseId: "",
        supplier: "V Bond Factory Direct",
        invoiceNumber: "",
        purchaseQuantity: "",
        purchasePrice: "",
        batchNumber: "",
      });
      loadData();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to record purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/inventory/adjust", adjustForm);
      successToast("⚡ Stock adjustment applied successfully!");
      setModalType(null);
      setAdjustForm({ productId: "", adjustmentType: "INCREASE", quantity: "", reason: "" });
      loadData();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to adjust stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDamageSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/inventory/damage", damageForm);
      successToast("⚠️ Damaged stock removed from inventory.");
      setModalType(null);
      setDamageForm({ productId: "", quantity: "", reason: "" });
      loadData();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to record damage.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/inventory/warehouses", warehouseForm);
      successToast("🏢 Warehouse created successfully!");
      setModalType(null);
      setWarehouseForm({ name: "", location: "", capacity: "10000" });
      loadData();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to create warehouse.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold">Loading Advanced Inventory & Warehouse Control...</div>;
  }

  return (
    <div className="container-fluid p-4 space-y-6">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Advanced Inventory & Warehouse</h1>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
              <FaShieldAlt /> REAL-TIME STOCK LIFECYCLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated stock deductions on retailer purchases, purchase entries, warehouse transfers & audit stock logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs flex items-center gap-2 border border-slate-300 cursor-pointer"
          >
            <FaSync /> Refresh
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setModalType("purchase")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition text-xs flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <FaFileInvoiceDollar /> Purchase Stock Entry
              </button>

              <button
                onClick={() => setModalType("adjust")}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition text-xs flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <FaTools /> Manual Edit
              </button>

              <button
                onClick={() => setModalType("damage")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition text-xs flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <FaExclamationTriangle /> Record Damage
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Dashboard Cards (Clickable for Instant Redirection to Filtered Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Stock & Asset Value */}
        <div
          onClick={() => { setActiveTab("live"); setFilterType("ALL"); }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
          title="Click to view all live stock balances"
        >
          <div>
            <span className="text-[11px] uppercase font-extrabold text-slate-400">Total Stock Value</span>
            <h3 className="text-2xl font-black mt-1">₹{metrics.inventoryValue.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-slate-300 mt-1">
              {metrics.totalProducts} Products | {metrics.totalStock.toLocaleString("en-IN")} Total Units
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-amber-400">
            <FaBoxes />
          </div>
        </div>

        {/* Card 2: Available Stock */}
        <div
          onClick={() => { setActiveTab("live"); setFilterType("ALL"); }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
          title="Click to view available stock"
        >
          <div>
            <span className="text-[11px] uppercase font-extrabold text-blue-100">Available Stock</span>
            <h3 className="text-2xl font-black mt-1">{metrics.availableStock.toLocaleString("en-IN")} <span className="text-xs font-bold text-blue-200">Units</span></h3>
            <p className="text-[10px] text-blue-200 mt-1">
              Reserved for Orders: <strong className="text-white font-bold">{metrics.reservedStock.toLocaleString("en-IN")} Units</strong>
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-blue-200">
            <FaDolly />
          </div>
        </div>

        {/* Card 3: Low Stock Alert Card (CLICKABLE -> REDIRECTS TO LOW STOCK ITEMS) */}
        <div
          onClick={() => { setActiveTab("alerts"); setFilterType("LOW"); }}
          className={`bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:scale-[1.03] transition-transform ${
            activeTab === "alerts" && filterType === "LOW" ? "ring-4 ring-amber-300" : ""
          }`}
          title="Click to view Low Stock items needing replenishment"
        >
          <div>
            <span className="text-[11px] uppercase font-extrabold text-amber-100">Low Stock Alert</span>
            <h3 className="text-2xl font-black mt-1">{metrics.lowStock} <span className="text-xs font-bold text-amber-100">Products</span></h3>
            <p className="text-[10px] text-amber-100 mt-1">Available Stock ≤ Minimum Limit (Click to filter)</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-amber-100 animate-pulse">
            <FaExclamationTriangle />
          </div>
        </div>

        {/* Card 4: Out of Stock Card (CLICKABLE -> REDIRECTS TO OUT OF STOCK ITEMS) */}
        <div
          onClick={() => { setActiveTab("alerts"); setFilterType("OUT"); }}
          className={`bg-gradient-to-br from-rose-600 to-red-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:scale-[1.03] transition-transform ${
            activeTab === "alerts" && filterType === "OUT" ? "ring-4 ring-red-300" : ""
          }`}
          title="Click to view Out of Stock items requiring immediate purchasing"
        >
          <div>
            <span className="text-[11px] uppercase font-extrabold text-rose-100">Out of Stock</span>
            <h3 className="text-2xl font-black mt-1">{metrics.outOfStock} <span className="text-xs font-bold text-rose-100">Products</span></h3>
            <p className="text-[10px] text-rose-200 mt-1">Stock == 0 (Click to filter)</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 text-rose-100 animate-bounce">
            <FaTimesCircle />
          </div>
        </div>

      </div>

      {/* Navigation Tabs & Alert Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveTab("live"); setFilterType("ALL"); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "live" && filterType === "ALL" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaBoxes /> Live Stock Balances ({inventory.length})
          </button>

          <button
            onClick={() => { setActiveTab("alerts"); setFilterType("ALERTS_ALL"); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "alerts" ? "bg-amber-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaExclamationTriangle /> Stock Alerts ({metrics.lowStock + metrics.outOfStock})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "history" ? "bg-purple-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaHistory /> Movement History ({history.length})
          </button>

          <button
            onClick={() => setActiveTab("warehouses")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "warehouses" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FaWarehouse /> Warehouses ({warehouses.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
          <input
            type="text"
            className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search product name, SKU, batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sub-Filter Pills for Stock Alerts */}
      {activeTab === "alerts" && (
        <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs font-bold text-slate-700">
          <span className="text-amber-900 font-extrabold flex items-center gap-1">
            <FaExclamationTriangle /> Filter Alert Data:
          </span>
          <button
            onClick={() => setFilterType("LOW")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filterType === "LOW" ? "bg-amber-600 text-white shadow font-black" : "bg-white text-amber-800 border border-amber-300 hover:bg-amber-100"
            }`}
          >
            ⚠️ Low Stock ({metrics.lowStock})
          </button>

          <button
            onClick={() => setFilterType("OUT")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filterType === "OUT" ? "bg-rose-600 text-white shadow font-black" : "bg-white text-rose-800 border border-rose-300 hover:bg-rose-100"
            }`}
          >
            🚫 Out of Stock ({metrics.outOfStock})
          </button>

          <button
            onClick={() => setFilterType("ALERTS_ALL")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filterType === "ALERTS_ALL" ? "bg-slate-800 text-white shadow font-black" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            All Alert Products ({metrics.lowStock + metrics.outOfStock})
          </button>
        </div>
      )}

      {/* TAB 1 & 2: LIVE STOCK BALANCES & ALERTS */}
      {(activeTab === "live" || activeTab === "alerts") && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                <tr>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Warehouse & Batch</th>
                  <th className="p-4 text-right">Current Stock</th>
                  <th className="p-4 text-right">Reserved</th>
                  <th className="p-4 text-right">Available Stock</th>
                  <th className="p-4 text-center">Min / Max Limits</th>
                  <th className="p-4 text-center">Stock Status</th>
                  {isAdmin && <th className="p-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400 font-bold">
                      {filterType === "LOW"
                        ? "No low stock products currently."
                        : filterType === "OUT"
                        ? "No out-of-stock products currently."
                        : "No inventory stock records matching criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const isOut = item.currentStock === 0;
                    const isLow = item.availableStock <= item.minimumStock && !isOut;

                    return (
                      <tr key={item._id} className="hover:bg-blue-50/40 transition">
                        {/* Product Info */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {item.product?.productName || "Unknown Product"}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>SKU: {item.product?.sku || "N/A"}</span>
                            <span>• Price: ₹{Number(item.product?.sellingPrice || 0).toLocaleString("en-IN")}</span>
                          </div>
                        </td>

                        {/* Warehouse & Batch */}
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {item.warehouse?.name || "Main Central Warehouse"}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Batch: {item.batchNumber || "BATCH-001"} ({item.warehouseLocation || "Rack A-1"})
                          </div>
                        </td>

                        {/* Stock Balances */}
                        <td className="p-4 text-right font-mono font-bold text-slate-800 text-sm">
                          {item.currentStock.toLocaleString("en-IN")}
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-amber-600">
                          {item.reservedStock.toLocaleString("en-IN")}
                        </td>

                        <td className="p-4 text-right font-mono font-black text-emerald-600 text-base">
                          {item.availableStock.toLocaleString("en-IN")}
                        </td>

                        <td className="p-4 text-center text-slate-500 font-mono text-[11px]">
                          Min: {item.minimumStock} | Max: {item.maximumStock}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4 text-center">
                          {isOut ? (
                            <span className="bg-red-100 text-red-800 font-extrabold text-[10px] px-3 py-1 rounded-full border border-red-200 flex items-center justify-center gap-1">
                              <FaTimesCircle /> OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-3 py-1 rounded-full border border-amber-200 flex items-center justify-center gap-1">
                              <FaExclamationTriangle /> LOW STOCK
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 font-extrabold text-[10px] px-3 py-1 rounded-full border border-green-200 flex items-center justify-center gap-1">
                              <FaCheckCircle /> OPTIMAL
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        {isAdmin && (
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setPurchaseForm((prev) => ({ ...prev, productId: item.product?._id }));
                                  setModalType("purchase");
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                                title="Add Purchase Stock"
                              >
                                + Buy
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustForm((prev) => ({ ...prev, productId: item.product?._id }));
                                  setModalType("adjust");
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                                title="Manual Adjustment"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK MOVEMENT HISTORY AUDIT LOG */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Audit Trail of All Stock Movements (Purchases, Sales, Adjustments & Returns)</span>
            <span className="text-slate-400">{history.length} Movements Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4 text-center">Movement Type</th>
                  <th className="p-4 text-right">Previous</th>
                  <th className="p-4 text-right">Qty Changed</th>
                  <th className="p-4 text-right">New Stock</th>
                  <th className="p-4">Reason / Reference</th>
                  <th className="p-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400 font-bold">
                      No stock movement audit records available.
                    </td>
                  </tr>
                ) : (
                  history.map((log) => {
                    const isPositive = log.quantityChanged > 0;
                    return (
                      <tr key={log._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono text-slate-500">
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </td>

                        <td className="p-4 font-bold text-slate-900">
                          {log.product?.productName || "Product"}
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              log.type === "Purchase" || log.type === "Return"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : log.type === "Sale" || log.type === "Damage"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {log.type}
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono text-slate-600">
                          {log.previousStock}
                        </td>

                        <td className={`p-4 text-right font-mono font-black text-sm ${isPositive ? "text-green-600" : "text-rose-600"}`}>
                          {isPositive ? `+${log.quantityChanged}` : log.quantityChanged}
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                          {log.newStock}
                        </td>

                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {log.reason} {log.referenceDoc && `(Doc: #${log.referenceDoc})`}
                        </td>

                        <td className="p-4 text-slate-500 font-semibold">
                          {log.performedBy?.fullName || "System Engine"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WAREHOUSES SUPPORT */}
      {activeTab === "warehouses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Distributor Warehouse Locations</h3>
            {isAdmin && (
              <button
                onClick={() => setModalType("warehouse")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FaPlus /> Add New Warehouse
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {warehouses.map((wh) => (
              <div key={wh._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-xl font-bold border border-blue-200">
                    <FaWarehouse />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {wh.code}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{wh.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{wh.location}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-semibold text-slate-700">
                  <span>Capacity: {wh.capacity?.toLocaleString("en-IN")} Units</span>
                  <span className="text-emerald-600 font-bold">Active Warehouse</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: PURCHASE STOCK ENTRY */}
      {modalType === "purchase" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-xl border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-black">
                  <FaFileInvoiceDollar />
                </div>
                <h3 className="font-extrabold text-base text-white">PURCHASE INVENTORY STOCK ENTRY</h3>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Product *</label>
                <select
                  required
                  className="w-full border rounded-xl p-2.5 outline-none font-bold"
                  value={purchaseForm.productId}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}
                >
                  <option value="">Select Product to Restock</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Purchase Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full border rounded-xl p-2.5 outline-none font-bold"
                    placeholder="e.g. 100"
                    value={purchaseForm.purchaseQuantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseQuantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Purchase Price per Unit (₹)</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl p-2.5 outline-none font-bold"
                    placeholder="e.g. 450"
                    value={purchaseForm.purchasePrice}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Supplier</label>
                  <input
                    type="text"
                    className="w-full border rounded-xl p-2.5 outline-none"
                    placeholder="V Bond Factory Direct"
                    value={purchaseForm.supplier}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Invoice Number</label>
                  <input
                    type="text"
                    className="w-full border rounded-xl p-2.5 outline-none font-mono"
                    placeholder="e.g. INV-PUR-9921"
                    value={purchaseForm.invoiceNumber}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setModalType(null)} className="px-5 py-2 rounded-xl border text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2 rounded-xl shadow cursor-pointer uppercase">
                  {submitting ? "Saving..." : "Add Purchased Stock Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL ADJUSTMENT */}
      {modalType === "adjust" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center font-black">
                  <FaTools />
                </div>
                <h3 className="font-extrabold text-base text-white">MANUAL STOCK ADJUSTMENT</h3>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Product *</label>
                <select
                  required
                  className="w-full border rounded-xl p-2.5 outline-none font-bold"
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} (Current: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Adjustment Type *</label>
                  <select
                    className="w-full border rounded-xl p-2.5 outline-none font-bold"
                    value={adjustForm.adjustmentType}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentType: e.target.value })}
                  >
                    <option value="INCREASE">➕ Increase Stock</option>
                    <option value="DECREASE">➖ Decrease Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 uppercase mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full border rounded-xl p-2.5 outline-none font-bold"
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Adjustment Reason (Mandatory) *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl p-2.5 outline-none font-medium"
                  placeholder="e.g. Physical inventory audit discrepancy correction"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setModalType(null)} className="px-5 py-2 rounded-xl border text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-2 rounded-xl shadow cursor-pointer uppercase">
                  {submitting ? "Saving..." : "Apply Stock Edit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD DAMAGE */}
      {modalType === "damage" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center font-black">
                  <FaExclamationTriangle />
                </div>
                <h3 className="font-extrabold text-base text-white">RECORD DAMAGED STOCK WRITE-OFF</h3>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleDamageSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Product *</label>
                <select
                  required
                  className="w-full border rounded-xl p-2.5 outline-none font-bold"
                  value={damageForm.productId}
                  onChange={(e) => setDamageForm({ ...damageForm, productId: e.target.value })}
                >
                  <option value="">Select Damaged Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} (Available Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Damaged Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border rounded-xl p-2.5 outline-none font-bold"
                  placeholder="e.g. 5"
                  value={damageForm.quantity}
                  onChange={(e) => setDamageForm({ ...damageForm, quantity: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Damage Reason (Mandatory) *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl p-2.5 outline-none"
                  placeholder="e.g. Bag torn during transport / Moisture exposure"
                  value={damageForm.reason}
                  onChange={(e) => setDamageForm({ ...damageForm, reason: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setModalType(null)} className="px-5 py-2 rounded-xl border text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-2 rounded-xl shadow cursor-pointer uppercase">
                  {submitting ? "Saving..." : "Remove Damaged Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE WAREHOUSE */}
      {modalType === "warehouse" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-black">
                  <FaWarehouse />
                </div>
                <h3 className="font-extrabold text-base text-white">ADD NEW WAREHOUSE LOCATION</h3>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleWarehouseSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl p-2.5 outline-none font-bold"
                  placeholder="e.g. Warangal Regional Depot"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Location Address *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl p-2.5 outline-none"
                  placeholder="e.g. Industrial Area, Warangal"
                  value={warehouseForm.location}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 uppercase mb-1">Max Capacity (Units)</label>
                <input
                  type="number"
                  className="w-full border rounded-xl p-2.5 outline-none font-mono"
                  placeholder="10000"
                  value={warehouseForm.capacity}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setModalType(null)} className="px-5 py-2 rounded-xl border text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2 rounded-xl shadow cursor-pointer uppercase">
                  {submitting ? "Saving..." : "Create Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}