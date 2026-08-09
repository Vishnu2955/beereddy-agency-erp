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
}) {
  const [selectedMethod, setSelectedMethod] = useState("qr"); // 'qr' | 'bank' | 'cod'
  const [adminSettings, setAdminSettings] = useState({
    adminPayee: "B UPENDER REDDY",
    upiVpa: "bupenderreddy@ybl",
    bankName: "State Bank of India",
    accountName: "B UPENDER REDDY (BEEREDDY AGENCY)",
    accountNumber: "40982341902",
    ifsc: "SBIN0020145",
    branch: "Main Branch",
    accountType: "Current",
    qrImage: "/admin_qr.jpg",
  });

  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      api.get("/settings/payment-details")
        .then((res) => {
          if (res.data?.settings) {
            setAdminSettings(res.data.settings);
          }
        })
        .catch((err) => console.log("Failed to load payment settings:", err));
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Calculate exact Grand Total including GST (18%)
  const subtotal = Number(order.totalAmount || 0);
  const gst = Number(order.gstAmount || 0) > 0 ? Number(order.gstAmount) : Math.round(subtotal * 0.18);
  const discount = Number(order.discount || 0);
  const grandTotal = Number(order.finalAmount || (subtotal + gst - discount));
  const paid = Number(order.paidAmount || order.totalPaid || 0);
  const remainingBalance = Math.max(0, grandTotal - paid);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyMsg(`Copied ${label}!`);
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        order: order._id,
        retailer: order.retailer?._id || order.retailer,
        amount: remainingBalance > 0 ? remainingBalance : grandTotal,
        paymentMethod: selectedMethod === "qr" ? "Official QR Code" : selectedMethod === "bank" ? "Bank Transfer" : "Cash on Delivery",
        transactionId: selectedMethod === "cod" ? "COD-PENDING" : transactionId || `TXN-${Date.now()}`,
        remarks: remarks || `Payment recorded for Invoice ${order.invoiceNumber || order.orderNumber}`,
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <FaLock className="text-blue-400" /> Official Payment Gateway
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Invoice #{order.invoiceNumber || order.orderNumber}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Uiverse Checkout & Payment Summary Card */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-center">
          <UiverseCheckoutCard
            title={`INVOICE #${order.invoiceNumber || order.orderNumber}`}
            shippingAddress={order.deliveryAddress || "Beereddy Agency Registered Dealer Address"}
            paymentMethod={selectedMethod === "qr" ? "Official QR Code" : selectedMethod === "bank" ? "Bank Transfer" : "Cash on Delivery"}
            paymentDetail={`Paid: ₹${paid.toLocaleString("en-IN")}`}
            subtotal={subtotal}
            shipping={0}
            tax={gst}
            discount={discount}
            totalPrice={remainingBalance > 0 ? remainingBalance : grandTotal}
            onApplyPromo={(code) => {
              if (code) successToast(`Promo code '${code}' applied!`);
            }}
            onCheckout={handleSubmitPayment}
            buttonText="Submit Payment"
            loading={submitting}
          />
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={() => setSelectedMethod("qr")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              selectedMethod === "qr" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaQrcode /> Official QR Code
          </button>
          <button
            onClick={() => setSelectedMethod("bank")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              selectedMethod === "bank" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaUniversity /> Bank Transfer
          </button>
          <button
            onClick={() => setSelectedMethod("cod")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              selectedMethod === "cod" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaMoneyBillWave /> Cash on Delivery (COD)
          </button>
        </div>

        {/* Payment Method Details */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {copyMsg && (
            <div className="p-2 bg-emerald-100 text-emerald-800 text-center rounded-xl text-xs font-bold">
              {copyMsg}
            </div>
          )}

          {/* METHOD 1: OFFICIAL QR CODE */}
          {selectedMethod === "qr" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                Scan the official Beereddy Agency UPI QR code using PhonePe, Google Pay, Paytm, or BHIM UPI app to pay <strong>₹{remainingBalance.toLocaleString("en-IN")}</strong>.
              </p>

              <div className="p-3 bg-white border-2 border-slate-300 rounded-3xl shadow-xl">
                {adminSettings.qrImage ? (
                  <img
                    src={adminSettings.qrImage}
                    alt="Official QR Code"
                    className="w-56 h-56 object-contain rounded-2xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <FaQrcode className="text-6xl mb-2" />
                    <span className="text-xs font-bold">Official QR Image</span>
                  </div>
                )}
              </div>

              {adminSettings.upiVpa && (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
                  <span>UPI ID: <strong>{adminSettings.upiVpa}</strong></span>
                  <button
                    onClick={() => copyToClipboard(adminSettings.upiVpa, "UPI ID")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* METHOD 2: BANK TRANSFER */}
          {selectedMethod === "bank" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Transfer funds directly via NEFT, RTGS, or IMPS to Beereddy Agency's bank account:
              </p>

              <div className="glass-panel p-5 rounded-2xl space-y-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Account Holder Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{adminSettings.accountName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Bank Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{adminSettings.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Account Number</span>
                  <div className="flex items-center gap-2 font-mono font-extrabold text-blue-700 dark:text-blue-400">
                    <span>{adminSettings.accountNumber}</span>
                    <button onClick={() => copyToClipboard(adminSettings.accountNumber, "Account Number")}>
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">IFSC Code</span>
                  <div className="flex items-center gap-2 font-mono font-extrabold text-blue-700 dark:text-blue-400">
                    <span>{adminSettings.ifsc}</span>
                    <button onClick={() => copyToClipboard(adminSettings.ifsc, "IFSC Code")}>
                      <FaCopy />
                    </button>
                  </div>
                </div>
                {adminSettings.branch && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">Branch</span>
                    <span className="text-slate-800 dark:text-slate-200">{adminSettings.branch}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* METHOD 3: CASH ON DELIVERY */}
          {selectedMethod === "cod" && (
            <div className="glass-panel p-6 rounded-2xl bg-amber-50/50 border border-amber-200 text-center space-y-3">
              <FaMoneyBillWave className="text-4xl text-amber-600 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-800">Cash on Delivery (COD) Selected</h3>
              <p className="text-xs text-slate-600">
                You can pay cash directly to the delivery executive upon goods arrival. Order status will remain in <strong>Payment Pending</strong> until confirmed by Admin.
              </p>
            </div>
          )}

          {/* Verification Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <FaInfoCircle className="text-base text-blue-600 shrink-0 mt-0.5" />
            <span>
              After completing payment using the QR code or bank transfer, please inform Beereddy Agency if required. Your payment will be verified by the Admin.
            </span>
          </div>

          {/* Transaction UTR / Reference Entry */}
          {selectedMethod !== "cod" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Transaction Ref / UTR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit UTR or Reference Number"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmitPayment}
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            <FaCheckCircle /> {submitting ? "Submitting Payment..." : "Confirm & Submit Payment Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
