import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaQrcode,
  FaUniversity,
  FaMoneyBillWave,
  FaCheckCircle,
  FaCopy,
  FaInfoCircle,
  FaLock,
} from "react-icons/fa";
import api from "../../services/api";
import { successToast } from "../../utils/toast";
import UiverseCheckoutCard from "./UiverseCheckoutCard";

export default function PaymentGatewayModal({
  order,
  isOpen,
  onClose,
  onPaymentSubmitted,
  initialMethod = "qr",
}) {
  const [selectedMethod, setSelectedMethod] = useState(initialMethod); // 'qr' | 'cod'
  const [adminSettings, setAdminSettings] = useState({
    adminPayee: "Beereddy Upendar Reddy",
    upiVpa: "9876543210@ybl",
    bankName: "State Bank of India",
    accountName: "BEEREDDY UPENDAR REDDY (BEEREDDY AGENCY)",
    accountNumber: "40982341902",
    ifsc: "SBIN0020145",
    branch: "Main Branch",
    accountType: "Current",
    qrImage: "/admin_qr.jpg",
  });

  const [customAmount, setCustomAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialMethod) setSelectedMethod(initialMethod);
      api.get("/settings/payment-details")
        .then((res) => {
          if (res.data?.settings) {
            setAdminSettings(res.data.settings);
          }
        })
        .catch((err) => console.log("Failed to load payment settings:", err));
    }
  }, [isOpen, initialMethod]);

  if (!isOpen) return null;

  const hasSpecificOrder = order && (order._id || order.orderNumber);

  // Calculate exact Grand Total including GST (18%)
  const subtotal = Number(order?.totalAmount || 0);
  const gst = Number(order?.gstAmount || 0) > 0 ? Number(order.gstAmount) : Math.round(subtotal * 0.18);
  const discount = Number(order?.discount || 0);
  const grandTotal = Number(order?.finalAmount || (subtotal + gst - discount));
  const paid = Number(order?.paidAmount || order?.totalPaid || 0);
  const orderRemainingDue = Math.max(0, grandTotal - paid);

  const paymentAmount = hasSpecificOrder
    ? (orderRemainingDue > 0 ? orderRemainingDue : grandTotal)
    : (Number(customAmount) > 0 ? Number(customAmount) : 0);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyMsg(`Copied ${label}!`);
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!hasSpecificOrder && (!customAmount || Number(customAmount) <= 0)) {
      return errorToast("Please enter a valid payment amount.");
    }

    setSubmitting(true);

    try {
      const payload = {
        order: order?._id || undefined,
        retailer: order?.retailer?._id || order?.retailer,
        amount: paymentAmount,
        paymentMethod: selectedMethod === "qr" ? "Official QR Code" : "Cash on Delivery",
        transactionId: selectedMethod === "cod" ? "COD-PENDING" : transactionId || `TXN-${Date.now()}`,
        remarks: remarks || `Payment recorded for ${order?.invoiceNumber || order?.orderNumber || "Official QR Payment"}`,
        status: "Pending",
      };

      const res = await api.post("/payments", payload);
      if (res.data.success) {
        successToast("Payment record submitted! Admin will verify your payment.");
        if (onPaymentSubmitted) onPaymentSubmitted();
        onClose();
      }
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Failed to submit payment record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <FaLock className="text-amber-400" /> Official Payment Gateway
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Pay to: <strong className="text-amber-300">{adminSettings.adminPayee || "Beereddy Upendar Reddy"}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Order Amount Banner */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          {hasSpecificOrder ? (
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Invoice / Order #
                </span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                  {order.invoiceNumber || order.orderNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Amount Due
                </span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                  ₹{paymentAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Enter Custom Payment Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4">
          <button
            onClick={() => setSelectedMethod("qr")}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              selectedMethod === "qr"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaQrcode /> Official QR Code
          </button>
          <button
            onClick={() => setSelectedMethod("cod")}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              selectedMethod === "cod"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaMoneyBillWave /> Cash on Delivery (COD)
          </button>
        </div>

        {/* Payment Method Details Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {copyMsg && (
            <div className="p-2 bg-emerald-100 text-emerald-800 text-center rounded-xl text-xs font-bold">
              {copyMsg}
            </div>
          )}

          {/* METHOD 1: OFFICIAL QR CODE */}
          {selectedMethod === "qr" && (
            <div className="flex flex-col items-center justify-center space-y-3.5">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-4 py-1.5 rounded-full text-xs font-extrabold">
                <FaCheckCircle className="text-amber-500" /> Pay to: {adminSettings.adminPayee || "Beereddy Upendar Reddy"}
              </div>

              {/* QR Image Box */}
              <div className="p-3 bg-white border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-lg">
                <img
                  src={adminSettings.qrImage || "/admin_qr.jpg"}
                  alt="Official Admin QR Code"
                  className="w-52 h-52 object-contain rounded-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/admin_qr.jpg";
                  }}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-center text-slate-700 dark:text-slate-300 w-full">
                <p className="font-semibold">
                  Scan QR using PhonePe / Google Pay / Paytm & pay to <strong className="text-amber-600 dark:text-amber-400">{adminSettings.adminPayee || "Beereddy Upendar Reddy"}</strong>.
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Once Admin ({adminSettings.adminPayee || "Beereddy Upendar Reddy"}) approves your payment, status will update to Succeeded.
                </p>
              </div>

              {adminSettings.upiVpa && (
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-mono w-full">
                  <span>UPI ID: <strong>{adminSettings.upiVpa}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(adminSettings.upiVpa, "UPI ID")}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
              )}

              {/* UTR Reference Input */}
              <div className="space-y-1.5 w-full pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  12-Digit UTR / Transaction Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter UPI Reference / UTR Number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* METHOD 2: CASH ON DELIVERY (COD) */}
          {selectedMethod === "cod" && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
              <FaMoneyBillWave className="text-4xl text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Cash on Delivery (COD) Selected</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                You can pay cash directly upon goods arrival. Order payment status will be updated to <strong>Paid</strong> once confirmed by Admin.
              </p>
            </div>
          )}

          {/* Remarks Input */}
          <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Payment Remarks / Delivery Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via PhonePe / Delivery at Godown"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitPayment}
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <FaCheckCircle /> {submitting ? "Submitting..." : "Submit Payment Record"}
          </button>
        </div>

      </div>
    </div>
  );
}
