import { useState, useEffect } from "react";
import {
  FaWhatsapp,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaSave,
  FaUserShield,
  FaClock,
  FaLock,
  FaCreditCard,
  FaUniversity,
  FaQrcode,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../services/api";
import { getUser } from "../utils/auth";

export default function Settings() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  const [activeTab, setActiveTab] = useState("whatsapp"); // 'whatsapp' | 'payment'

  // WhatsApp State
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState("");
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState("System Admin");
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");
  const [loadingWa, setLoadingWa] = useState(true);
  const [savingWa, setSavingWa] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [waMessage, setWaMessage] = useState({ type: "", text: "" });
  const [testModalData, setTestModalData] = useState(null);

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    adminPayee: "",
    upiVpa: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    qrImage: "",
  });
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (isAdmin) {
      fetchWhatsAppSettings();
      fetchPaymentSettings();
    }
  }, [isAdmin]);

  const fetchWhatsAppSettings = async () => {
    try {
      setLoadingWa(true);
      const res = await api.get("/settings/whatsapp");
      if (res.data.success) {
        setAdminWhatsAppNumber(res.data.adminWhatsAppNumber || "");
        setWhatsAppEnabled(Boolean(res.data.whatsAppEnabled));
        setLastUpdatedBy(res.data.lastUpdatedBy || "System Admin");
        setLastUpdatedAt(res.data.lastUpdatedAt || "");
      }
    } catch (err) {
      console.error("Failed to load WhatsApp settings:", err);
      setWaMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load WhatsApp settings.",
      });
    } finally {
      setLoadingWa(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      setLoadingPayment(true);
      const res = await api.get("/settings/payment-details");
      if (res.data.success && res.data.settings) {
        setPaymentSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Failed to load payment settings:", err);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    setWaMessage({ type: "", text: "" });
    setSavingWa(true);

    try {
      const res = await api.put("/settings/whatsapp", {
        adminWhatsAppNumber,
        whatsAppEnabled,
      });

      if (res.data.success) {
        setWaMessage({ type: "success", text: res.data.message });
        setAdminWhatsAppNumber(res.data.adminWhatsAppNumber);
        setWhatsAppEnabled(res.data.whatsAppEnabled);
        setLastUpdatedBy(res.data.lastUpdatedBy);
        setLastUpdatedAt(res.data.lastUpdatedAt);
      }
    } catch (err) {
      setWaMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update WhatsApp settings.",
      });
    } finally {
      setSavingWa(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setWaMessage({ type: "", text: "" });
    setTestingWa(true);

    try {
      const res = await api.post("/settings/whatsapp/test", {
        adminWhatsAppNumber,
      });

      if (res.data.success) {
        setTestModalData(res.data);
        setWaMessage({ type: "success", text: res.data.message });
      }
    } catch (err) {
      setWaMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send test message.",
      });
    } finally {
      setTestingWa(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (_) {
      return dateStr;
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
          <FaLock className="text-amber-400 text-4xl mx-auto" />
          <h2 className="text-xl font-bold text-white">Admin Authorization Required</h2>
          <p className="text-slate-400 text-sm">
            Only System Administrators have permission to view or configure notification & ERP settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <span>Settings</span>
            <span>/</span>
            <span>Notifications</span>
            <span>/</span>
            <span className="text-emerald-400">WhatsApp</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            System & Notification Settings
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Configure automated WhatsApp alerts for orders and payment settings.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "whatsapp"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FaWhatsapp className="text-base" />
            WhatsApp Alerts
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "payment"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FaCreditCard className="text-base" />
            Payment Details
          </button>
        </div>
      </div>

      {/* WHATSAPP SETTINGS TAB */}
      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main WhatsApp Configuration Form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FaWhatsapp className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Admin WhatsApp Settings</h2>
                  <p className="text-slate-400 text-xs">
                    Receive instant WhatsApp notifications when retailers place new orders.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    whatsAppEnabled
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                      : "bg-red-950/60 text-red-300 border-red-500/40"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      whatsAppEnabled ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  {whatsAppEnabled ? "Notifications Active" : "Notifications Disabled"}
                </span>
              </div>
            </div>

            {/* Notification Toast Message */}
            {waMessage.text && (
              <div
                className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 border ${
                  waMessage.type === "success"
                    ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
                    : "bg-red-950/40 text-red-300 border-red-800/60"
                }`}
              >
                {waMessage.type === "success" ? (
                  <FaCheckCircle className="text-emerald-400 text-lg shrink-0" />
                ) : (
                  <FaExclamationTriangle className="text-red-400 text-lg shrink-0" />
                )}
                <div className="flex-1">{waMessage.text}</div>
              </div>
            )}

            {loadingWa ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading WhatsApp configuration...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveWhatsApp} className="space-y-6">
                {/* WhatsApp Phone Number Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Admin WhatsApp Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                      <FaWhatsapp className="text-lg" />
                    </div>
                    <input
                      type="text"
                      value={adminWhatsAppNumber}
                      onChange={(e) => setAdminWhatsAppNumber(e.target.value)}
                      placeholder="e.g. +919876543210 or 919876543210"
                      className="w-full bg-slate-950 text-white pl-11 pr-4 py-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <FaInfoCircle className="text-slate-400" />
                    Include country code (e.g. <span className="text-emerald-400 font-mono">+919876543210</span>). Spaces and dashes will be cleaned automatically.
                  </p>
                </div>

                {/* Enable / Disable WhatsApp Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white block">
                      Enable WhatsApp Notifications
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Automatically send real-time order alerts to this WhatsApp number when retailers place orders.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsAppEnabled}
                      onChange={(e) => setWhatsAppEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                {/* Buttons: Save & Test */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingWa}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/20 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {savingWa ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaSave className="text-base" />
                    )}
                    {savingWa ? "Saving Changes..." : "Save Settings"}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestWhatsApp}
                    disabled={testingWa || !adminWhatsAppNumber}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-6 py-3 rounded-xl border border-slate-700 transition text-sm disabled:opacity-40 cursor-pointer"
                  >
                    {testingWa ? (
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaPaperPlane className="text-base" />
                    )}
                    {testingWa ? "Sending Test..." : "Send Test Message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Audit Metadata Sidebar Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-3 flex items-center gap-2">
                <FaUserShield className="text-indigo-400" />
                Audit & System Info
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FaUserShield className="text-slate-400" />
                    Last Modified By
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {lastUpdatedBy || "System Admin"}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FaClock className="text-slate-400" />
                    Last Updated Date & Time
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {formatDate(lastUpdatedAt)}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Currently Active Number
                  </div>
                  <div className="text-sm font-extrabold text-white font-mono">
                    {adminWhatsAppNumber || "Not Configured"}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Information Box */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FaInfoCircle /> Order Notification Rule
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When WhatsApp Notifications are enabled, order details (Retailer Name, Order ID, Items, Total Amount) are dynamically formatted and dispatched to the configured admin WhatsApp number. Orders will always be saved securely even if network dispatch experiences temporary delay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SETTINGS TAB */}
      {activeTab === "payment" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FaUniversity className="text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Bank & UPI Payment Settings</h2>
              <p className="text-slate-400 text-xs">
                Bank account and UPI QR details shown to retailers during payment checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Payee Name</label>
              <input
                type="text"
                readOnly
                value={paymentSettings.adminPayee}
                className="w-full bg-slate-950 text-slate-300 p-3 rounded-xl border border-slate-800 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">UPI VPA / ID</label>
              <input
                type="text"
                readOnly
                value={paymentSettings.upiVpa}
                className="w-full bg-slate-950 text-slate-300 p-3 rounded-xl border border-slate-800 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Bank Name</label>
              <input
                type="text"
                readOnly
                value={paymentSettings.bankName}
                className="w-full bg-slate-950 text-slate-300 p-3 rounded-xl border border-slate-800 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Account Number</label>
              <input
                type="text"
                readOnly
                value={paymentSettings.accountNumber}
                className="w-full bg-slate-950 text-slate-300 p-3 rounded-xl border border-slate-800 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Test Message Result Modal */}
      {testModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <FaWhatsapp className="text-emerald-400 text-2xl" />
              <h3 className="text-lg font-bold text-white">WhatsApp Test Dispatched</h3>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Target Number:</span>
                <span className="text-emerald-400 font-mono text-sm">{testModalData.targetNumber}</span>
              </div>
              <div className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-slate-900 p-3.5 rounded-lg border border-slate-800 leading-relaxed">
                {testModalData.body}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTestModalData(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Close
              </button>

              {testModalData.whatsappUrl && (
                <a
                  href={testModalData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30"
                >
                  <FaWhatsapp className="text-base" />
                  Launch WhatsApp & Send
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}