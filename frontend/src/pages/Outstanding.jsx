import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import outstandingService from "../services/outstandingService";
import api from "../services/api";
import {
  FaSync,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTimes,
  FaFileInvoice,
  FaPhone,
  FaStore,
  FaUserCheck,
  FaCalendarAlt,
} from "react-icons/fa";

export default function Outstanding() {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State for Selected Retailer Statement
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [retailerOrders, setRetailerOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadOutstanding();
  }, []);

  const loadOutstanding = async () => {
    try {
      setLoading(true);
      const data = await outstandingService.getAllOutstanding();
      setRetailers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRetailerDetails = async (retailerObj) => {
    setSelectedRetailer(retailerObj);
    try {
      setLoadingDetails(true);
      const res = await api.get(`/orders?retailer=${retailerObj.retailerId}`);
      setRetailerOrders(res.data?.orders || []);
    } catch (err) {
      console.error(err);
      setRetailerOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) =>
      (r.retailer || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.shopName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.fullName || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [retailers, search]);

  const summary = useMemo(() => {
    const totalOrders = retailers.reduce((sum, r) => sum + Number(r.totalOrders || 0), 0);
    const totalPayments = retailers.reduce((sum, r) => sum + Number(r.totalPayments || 0), 0);
    const totalOutstanding = retailers.reduce((sum, r) => sum + Number(r.outstanding || 0), 0);
    const totalCredit = retailers.reduce((sum, r) => sum + Number(r.creditLimit || 0), 0);
    const availableCredit = retailers.reduce((sum, r) => sum + Number(r.availableCredit || 0), 0);
    const retailersWithDue = retailers.filter((r) => r.outstanding > 0).length;

    return { totalOrders, totalPayments, totalOutstanding, totalCredit, availableCredit, retailersWithDue };
  }, [retailers]);

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold">Loading Outstanding Dashboard...</div>;
  }

  return (
    <div className="container-fluid p-4 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Outstanding Dashboard</h1>
            <span className="bg-red-100 text-red-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-red-200">
              FORMULA: ORDERS - PAYMENTS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time retailer outstanding balances (Total Orders Amount - Total Amount Paid up to date)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadOutstanding}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 border border-slate-300"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-red-100">Total Outstanding Balance</span>
            <h3 className="text-2xl font-black mt-1">₹{summary.totalOutstanding.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-red-200 mt-1">{summary.retailersWithDue} Retailers with pending due</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-blue-100">Total Order Amount</span>
            <h3 className="text-2xl font-black mt-1">₹{summary.totalOrders.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-blue-200 mt-1">Total non-cancelled order value</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
            <FaMoneyBillWave />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-green-100">Total Paid Amount</span>
            <h3 className="text-2xl font-black mt-1">₹{summary.totalPayments.toLocaleString("en-IN")}</h3>
            <p className="text-[10px] text-green-200 mt-1">Total payments paid to date</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
            <FaCheckCircle />
          </div>
        </div>
      </div>

      {/* Main Retailers Outstanding Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Retailers Balance Breakdown</h3>
            <p className="text-xs text-slate-500">Calculated as: Outstanding = Total Orders Amount - Total Amount Paid</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search retailer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-600">
              <tr>
                <th className="p-4">Retailer</th>
                <th className="p-4 text-right">Total Orders (₹)</th>
                <th className="p-4 text-right">Total Paid (₹)</th>
                <th className="p-4 text-right">Outstanding Balance (₹)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRetailers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                    No retailer outstanding records found.
                  </td>
                </tr>
              ) : (
                filteredRetailers.map((r) => {
                  const ordersAmt = Number(r.totalOrders || 0);
                  const paidAmt = Number(r.totalPayments || 0);
                  const outAmt = Number(r.outstanding || 0);

                  return (
                    <tr key={r.retailerId} className="hover:bg-blue-50/50 transition">
                      <td className="p-4 font-bold text-slate-800">
                        {r.retailer || r.shopName || r.fullName}
                      </td>

                      <td className="p-4 text-right font-medium text-slate-700">
                        ₹{ordersAmt.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-right font-semibold text-green-600">
                        ₹{paidAmt.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-right font-black text-red-600 text-base">
                        ₹{outAmt.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-center">
                        {outAmt > 0 ? (
                          <span className="bg-red-100 text-red-800 text-xs font-extrabold px-3 py-1 rounded-full border border-red-200">
                            Due Pending
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1 rounded-full border border-green-200">
                            Fully Cleared
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenRetailerDetails(r)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RETAILER OUTSTANDING STATEMENT MODAL */}
      {selectedRetailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-black text-lg border border-blue-500/30">
                  <FaStore />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {selectedRetailer.shopName || selectedRetailer.fullName || selectedRetailer.retailer}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Owner: {selectedRetailer.fullName || selectedRetailer.retailer}</span>
                    {selectedRetailer.phone && <span>• Phone: {selectedRetailer.phone}</span>}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRetailer(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Financial Metrics Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Total Orders Value</span>
                  <span className="text-xl font-black text-slate-800">
                    ₹{Number(selectedRetailer.totalOrders || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase block">Total Amount Paid</span>
                  <span className="text-xl font-black text-emerald-600">
                    ₹{Number(selectedRetailer.totalPayments || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                  <span className="text-[10px] text-red-600 font-extrabold uppercase block">Outstanding Due</span>
                  <span className="text-xl font-black text-red-600">
                    ₹{Number(selectedRetailer.outstanding || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Order Invoices Breakdown Table */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <FaFileInvoice className="text-blue-600" /> Retailer Order Invoices History
                </h4>

                {loadingDetails ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-semibold">
                    Loading retailer order breakdown...
                  </div>
                ) : retailerOrders.length === 0 ? (
                  <div className="p-8 bg-slate-50 text-center text-xs text-slate-400 rounded-2xl border border-slate-200 font-medium">
                    No orders registered for this retailer yet.
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-200/70 text-slate-700 uppercase font-extrabold">
                        <tr>
                          <th className="p-3">Invoice #</th>
                          <th className="p-3 text-center">Date</th>
                          <th className="p-3 text-right">Total (₹)</th>
                          <th className="p-3 text-center">Payment Status</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {retailerOrders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-white transition">
                            <td className="p-3 font-mono font-bold text-blue-700">
                              #{ord.invoiceNumber || ord.orderNumber}
                            </td>
                            <td className="p-3 text-center text-slate-500">
                              {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-black text-slate-800">
                              ₹{Number(ord.finalAmount || ord.totalAmount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  (ord.paymentStatus || "").toLowerCase() === "paid"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : (ord.paymentStatus || "").toLowerCase() === "partial"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {ord.paymentStatus || "Pending"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedRetailer(null);
                                  navigate(`/invoice/${ord._id}`);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition"
                              >
                                View Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Retailer ID: {selectedRetailer.retailerId}</span>
              <button
                onClick={() => setSelectedRetailer(null)}
                className="bg-slate-900 text-white font-extrabold px-5 py-2 rounded-xl hover:bg-slate-800 transition"
              >
                Close Statement
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}