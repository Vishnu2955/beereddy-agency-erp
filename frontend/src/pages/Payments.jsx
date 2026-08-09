import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getUser } from "../utils/auth";
import { successToast, errorToast } from "../utils/toast";
import PaymentGatewayModal from "../components/payments/PaymentGatewayModal";
import SkeletonLoader from "../components/common/SkeletonLoader";
import UiverseCheckoutCard from "../components/payments/UiverseCheckoutCard";
import {
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaHistory,
  FaFileInvoice,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaQrcode,
  FaUniversity,
  FaWallet,
  FaMoneyBillAlt,
  FaBolt,
  FaSearch,
  FaPlus,
} from "react-icons/fa";

export default function PaymentReport() {
  const currentUser = getUser();
  const isRetailer = currentUser?.role === "retailer";

  const [payments, setPayments] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [upiVpaInput, setUpiVpaInput] = useState("beereddyagency@ybl");

  // Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedOrderForGateway, setSelectedOrderForGateway] = useState(null);

  // Admin Settings Modal State
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    adminPayee: "B UPENDER REDDY",
    upiVpa: "bupenderreddy@ybl",
    bankName: "State Bank of India",
    accountName: "B UPENDER REDDY (BEEREDDY AGENCY)",
    accountNumber: "40982341902",
    ifsc: "SBIN0020145",
    qrImage: "/admin_qr.jpg",
  });
  const [qrFile, setQrFile] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [form, setForm] = useState({
    retailer: "",
    order: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Pending",
    referenceNumber: "",
    notes: "",
  });

  const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"];
  const paymentStatuses = ["Pending", "Approved", "Rejected"];

  const loadPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRetailers = async () => {
    try {
      const res = await api.get("/retailers");
      setRetailers(res.data.retailers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const endpoint = isRetailer ? "/orders/my-orders" : "/orders";
      const res = await api.get(endpoint);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.get("/settings/payment-details");
      if (res.data?.settings) {
        setAdminSettings(res.data.settings);
      }
    } catch (err) {
      console.log("Settings load notice:", err);
    }
  };

  const handleSaveAdminSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const formData = new FormData();
      formData.append("adminPayee", adminSettings.adminPayee);
      formData.append("upiVpa", adminSettings.upiVpa);
      formData.append("bankName", adminSettings.bankName);
      formData.append("accountName", adminSettings.accountName);
      formData.append("accountNumber", adminSettings.accountNumber);
      formData.append("ifsc", adminSettings.ifsc);
      if (qrFile) {
        formData.append("qrImage", qrFile);
      }

      const res = await api.put("/settings/payment-details", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.settings) {
        setAdminSettings(res.data.settings);
      }
      successToast("⚡ Admin Bank Account & QR Code details updated successfully!");
      setIsAdminSettingsOpen(false);
      setQrFile(null);
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Failed to update bank & QR details.");
    } finally {
      setSavingSettings(false);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPayments(),
        !isRetailer && loadRetailers(),
        loadOrders(),
        loadSettings(),
      ].filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const orderPaidMap = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      if ((p.status || p.paymentStatus || "").toLowerCase() === "approved" && p.order) {
        const orderId = typeof p.order === "object" ? p.order._id : p.order;
        if (orderId) {
          map[orderId] = (map[orderId] || 0) + Number(p.amount || 0);
        }
      }
    });
    return map;
  }, [payments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "order") {
      const selectedOrd = orders.find((o) => o._id === value);
      let autoAmount = "";
      if (selectedOrd) {
        const orderTotal = Number(selectedOrd.finalAmount || selectedOrd.totalAmount || 0);
        const orderPaid = orderPaidMap[selectedOrd._id] || 0;
        const remainingDue = Math.max(0, Math.round((orderTotal - orderPaid) * 100) / 100);
        autoAmount = remainingDue > 0 ? String(remainingDue) : "";
      }
      setForm((prev) => ({
        ...prev,
        order: value,
        amount: autoAmount !== "" ? autoAmount : prev.amount,
      }));
    } else if (name === "retailer") {
      setForm((prev) => ({
        ...prev,
        retailer: value,
        order: "",
        amount: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setForm({
      retailer: "",
      order: "",
      amount: "",
      paymentMethod: "Cash",
      status: "Pending",
      referenceNumber: "",
      notes: "",
    });
  };

  const getOrderTotalWithGst = (o) => {
    const subtotal = Number(o.totalAmount || 0);
    const gst = Number(o.gstAmount || 0) > 0 ? Number(o.gstAmount) : Math.round(subtotal * 0.18);
    const discount = Number(o.discount || 0);
    const calculatedFinal = subtotal + gst - discount;
    return Number(o.finalAmount && Number(o.finalAmount) > subtotal ? o.finalAmount : calculatedFinal);
  };

  const selectedRetailerOrders = useMemo(() => {
    if (!form.retailer && !isRetailer) return [];

    return orders.filter((o) => {
      if (!o.retailer) return false;
      const rId = typeof o.retailer === "object" ? (o.retailer._id || o.retailer.id) : o.retailer;
      
      if (!isRetailer && String(rId) !== String(form.retailer)) return false;

      const orderTotal = getOrderTotalWithGst(o);
      const orderPaid = orderPaidMap[o._id] || 0;
      const remainingDue = Math.max(0, Math.round((orderTotal - orderPaid) * 100) / 100);

      const isPaid = (o.paymentStatus || "").toLowerCase() === "paid";
      const isCancelled = (o.orderStatus || "").toLowerCase() === "cancelled";

      // Hide if cancelled, marked Paid, or remaining due is <= 0
      return !isCancelled && !isPaid && remainingDue > 0;
    });
  }, [orders, form.retailer, isRetailer, orderPaidMap]);

  const unpaidRetailerOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderTotal = getOrderTotalWithGst(o);
      const orderPaid = orderPaidMap[o._id] || 0;
      const remainingDue = Math.max(0, Math.round((orderTotal - orderPaid) * 100) / 100);

      const isPaid = (o.paymentStatus || "").toLowerCase() === "paid";
      const isCancelled = (o.orderStatus || "").toLowerCase() === "cancelled";

      // Hide if cancelled, marked Paid, or remaining due is <= 0
      return !isCancelled && !isPaid && remainingDue > 0;
    });
  }, [orders, orderPaidMap]);

  // Comprehensive Payment & Outstanding Statistics
  const metrics = useMemo(() => {
    const totalOrdersAmount = orders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + getOrderTotalWithGst(o), 0);

    const totalPaid = payments
      .filter((p) => (p.status || p.paymentStatus || "").toLowerCase() === "approved")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Sum remaining due exclusively from unpaidRetailerOrders so when all orders are paid, outstanding balance is exactly 0
    const outstandingBalance = unpaidRetailerOrders.reduce((sum, o) => {
      const orderTotal = getOrderTotalWithGst(o);
      const orderPaid = orderPaidMap[o._id] || 0;
      const rem = Math.max(0, Math.round((orderTotal - orderPaid) * 100) / 100);
      return sum + rem;
    }, 0);

    const pendingOrdersCount = unpaidRetailerOrders.length;
    const totalTxns = payments.length;

    return { totalOrdersAmount, totalPaid, outstandingBalance, pendingOrdersCount, totalTxns };
  }, [orders, payments, orderPaidMap, unpaidRetailerOrders]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const retailerName =
        payment.retailer?.shopName ||
        payment.retailer?.fullName ||
        "";

      const method = payment.paymentMethod || "";
      const status = payment.status || payment.paymentStatus || "";
      const invoice = payment.order?.invoiceNumber || payment.order?.orderNumber || "";

      return (
        retailerName.toLowerCase().includes(search.toLowerCase()) ||
        method.toLowerCase().includes(search.toLowerCase()) ||
        status.toLowerCase().includes(search.toLowerCase()) ||
        invoice.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [payments, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await api.post("/payments", {
        retailer: form.retailer,
        order: form.order || undefined,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        status: form.status,
        referenceNumber: form.referenceNumber,
        notes: form.notes,
      });

      successToast("Payment record saved successfully.");
      resetForm();
      await loadAll();
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Unable to save payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleRetailerInstantAutoPay = async (targetOrder = null) => {
    const payOrder = targetOrder || orders.find((o) => o._id === form.order) || unpaidRetailerOrders[0];
    const payAmount = Number(form.amount || payOrder?.finalAmount || payOrder?.totalAmount || 0);

    if (!payAmount || payAmount <= 0) {
      return errorToast("Please select an invoice or enter a valid payment amount.");
    }

    try {
      setSaving(true);
      const refNo = form.referenceNumber || `UPI-AUTO-${Date.now().toString().slice(-6)}`;

      await api.post("/payments", {
        retailer: currentUser._id,
        order: payOrder?._id || undefined,
        amount: payAmount,
        paymentMethod: "UPI",
        status: "Approved",
        referenceNumber: refNo,
        notes: "Auto-Verified Direct UPI Payment to B UPENDER REDDY",
      });

      // Note: Backend POST /api/payments automatically updates paymentStatus to Paid.

      successToast("⚡ Payment Auto-Verified & Approved! Sent to Admin (B UPENDER REDDY).");
      resetForm();
      await loadAll();
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Failed to complete payment auto-verification.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/payments/${id}/status`, { status });
      await loadAll();
      successToast(`Payment ${status} successfully.`);
    } catch (err) {
      errorToast(err.response?.data?.message || "Unable to update payment.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="stats" count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  const upiVpa = upiVpaInput.trim() || "beereddyagency@ybl";
  const upiName = "Beereddy Agency ERP";
  const amountParam = form.amount ? `&am=${form.amount}` : "";
  const rawUpiPayload = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(upiName)}&cu=INR${amountParam}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(rawUpiPayload)}`;

  return (
    <div className="container-fluid p-4 space-y-6">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isRetailer ? "My Payments & Outstanding Portal" : "Admin Payments Management"}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <FaShieldAlt /> 256-BIT SECURE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isRetailer
              ? "View your personal outstanding balance, pay pending invoices via UPI/Gateway & track timeline"
              : "Manage retailer payments, record manual entries, approve submissions & view agency metrics"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {isRetailer && (
            <button
              onClick={() => {
                setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                setIsGatewayOpen(true);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <FaCreditCard /> Launch Online Gateway
            </button>
          )}

          {!isRetailer && (
            <button
              onClick={() => setIsAdminSettingsOpen(true)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer border border-slate-800"
            >
              <FaQrcode className="text-amber-400 text-sm" /> Edit Bank & QR Settings
            </button>
          )}

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RETAILER SPECIFIC OUTSTANDING BALANCE & PAYMENT METHODS */}
      {/* ======================================================== */}
      {isRetailer && (
        <div className="space-y-6">
          
          {/* RETAILER OUTSTANDING BALANCE BANNER (ONLY HIS OUTSTANDING DUE) */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/20 text-rose-300 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
                  <FaExclamationTriangle /> MY PERSONAL DUE STATEMENT
                </span>
                {metrics.outstandingBalance > 0 ? (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    PAYMENT DUE
                  </span>
                ) : (
                  <span className="bg-green-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    FULLY CLEARED
                  </span>
                )}
              </div>

              <span className="text-xs font-semibold text-slate-400 block">My Outstanding Balance Due</span>
              <h2 className="text-4xl font-black text-rose-400 tracking-tight">
                ₹{metrics.outstandingBalance.toLocaleString("en-IN")}
              </h2>

              <p className="text-xs text-slate-300">
                Total Orders Purchased: <strong className="text-white">₹{metrics.totalOrdersAmount.toLocaleString("en-IN")}</strong> | Total Amount Paid: <strong className="text-green-400">₹{metrics.totalPaid.toLocaleString("en-IN")}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <FaLock /> Pay Due Balance Now
              </button>
            </div>
          </div>

          {/* UIVERSE CHECKOUT & PAYMENT CARD (From Uiverse.io by mi-series) */}
          <div className="flex justify-center my-6">
            <UiverseCheckoutCard
              title="RETAILER CHECKOUT & DUE PAYMENT"
              shippingAddress={currentUser?.address || "Registered Business Store Address, Beereddy Network"}
              paymentMethod="Official QR / UPI / Bank Transfer"
              paymentDetail="BEEREDDY AGENCY ERP • GST Billing"
              subtotal={metrics.totalOrdersAmount}
              shipping={0}
              tax={Math.round(metrics.totalOrdersAmount * 0.18)}
              discount={metrics.totalPaid}
              totalPrice={metrics.outstandingBalance}
              onApplyPromo={(code) => {
                if (code) successToast(`Promo code '${code}' submitted for admin review!`);
              }}
              onCheckout={() => {
                setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                setIsGatewayOpen(true);
              }}
              buttonText="Pay Due Now"
            />
          </div>

          {/* WIDE RANGE OF E-COMMERCE PAYMENT OPTIONS TILES */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <FaCreditCard className="text-rose-600" /> Supported Payment Gateways & Options
            </h3>
            <p className="text-xs text-slate-500">Select any method below to pay your pending invoices instantly:</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              {/* Option 1: 1-Tap UPI Apps */}
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 transition flex flex-col items-center text-center space-y-2 group shadow-sm"
              >
                <FaBolt className="text-2xl text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs">Recommended UPI</span>
                <span className="text-[10px] text-amber-700 font-semibold">GPay / PhonePe / Paytm</span>
              </button>

              {/* Option 2: Dynamic QR */}
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 transition flex flex-col items-center text-center space-y-2 group shadow-sm"
              >
                <FaQrcode className="text-2xl text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs">Scan NPCI QR Code</span>
                <span className="text-[10px] text-purple-700 font-semibold">Live Timer QR Code</span>
              </button>

              {/* Option 3: Credit / Debit Card */}
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 transition flex flex-col items-center text-center space-y-2 group shadow-sm"
              >
                <FaCreditCard className="text-2xl text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs">Credit / Debit Cards</span>
                <span className="text-[10px] text-blue-700 font-semibold">Visa, Master, RuPay</span>
              </button>

              {/* Option 4: Net Banking */}
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 transition flex flex-col items-center text-center space-y-2 group shadow-sm"
              >
                <FaUniversity className="text-2xl text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs">Net Banking</span>
                <span className="text-[10px] text-indigo-700 font-semibold">SBI, HDFC, ICICI, Axis</span>
              </button>

              {/* Option 5: Wallets */}
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-900 transition flex flex-col items-center text-center space-y-2 group shadow-sm"
              >
                <FaWallet className="text-2xl text-teal-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs">Wallets</span>
                <span className="text-[10px] text-teal-700 font-semibold">Paytm, PhonePe, Mobikwik</span>
              </button>

              {/* Option 6: COD */}
              <button
                onClick={() => {
                  setSelectedOrderForGateway(unpaidRetailerOrders[0] || null);
                  setIsGatewayOpen(true);
                }}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 transition flex flex-col items-center text-center space-y-2 group shadow-sm"
              >
                <FaMoneyBillAlt className="text-2xl text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-xs">Cash on Delivery</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Pay Cash Upon Delivery</span>
              </button>

            </div>
          </div>

          {/* Pending Invoices Grid (Direct UPI Pay Buttons) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <FaFileInvoice className="text-blue-600" /> Pending Invoices - Select & Pay Direct
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap "Pay via UPI App" to open PhonePe / GPay / Paytm on your mobile with prefilled payment details
                </p>
              </div>

              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-yellow-200">
                {unpaidRetailerOrders.length} Pending Invoices
              </span>
            </div>

            {unpaidRetailerOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                🎉 All your invoices are fully paid! No pending balance.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {unpaidRetailerOrders.map((ord) => {
                  const ordTotal = getOrderTotalWithGst(ord);
                  const ordPaid = orderPaidMap[ord._id] || 0;
                  const ordDue = Math.max(0, ordTotal - ordPaid);
                  const directUpiLink = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent("B UPENDER REDDY")}&am=${ordDue}&cu=INR&tn=Invoice_${ord.invoiceNumber || ord.orderNumber}`;

                  return (
                    <div
                      key={ord._id}
                      className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                            {ord.invoiceNumber || ord.orderNumber}
                          </span>
                          {ordPaid > 0 ? (
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                              PARTIALLY PAID
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-0.5">
                          <span className="text-xs text-slate-500 font-medium">Remaining Balance Left to Pay</span>
                          <p className="text-2xl font-black text-rose-600">
                            ₹{ordDue.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Invoice Total: <strong className="text-slate-800">₹{ordTotal.toLocaleString("en-IN")}</strong> | Paid: <strong className="text-green-600">₹{ordPaid.toLocaleString("en-IN")}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <a
                          href={directUpiLink}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              order: ord._id,
                              amount: String(ordDue),
                            }));
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                        >
                          📱 Pay Remaining Balance via UPI <FaExternalLinkAlt className="text-[10px]" />
                        </a>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleRetailerInstantAutoPay(ord)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm transition"
                          >
                            ⚡ Mark Paid
                          </button>

                          <button
                            onClick={() => {
                              setSelectedOrderForGateway(ord);
                              setIsGatewayOpen(true);
                            }}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm transition"
                          >
                            💳 Gateway UI
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN FINANCIAL OVERVIEW & MANUAL PAYMENT ENTRY FORM */}
      {/* ======================================================== */}
      {!isRetailer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-green-100">Total Payments Approved</span>
              <h3 className="text-2xl font-black mt-1">₹{metrics.totalPaid.toLocaleString("en-IN")}</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
              <FaCheckCircle />
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-rose-100">Agency Outstanding Due</span>
              <h3 className="text-2xl font-black mt-1">₹{metrics.outstandingBalance.toLocaleString("en-IN")}</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
              <FaExclamationTriangle />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-purple-100">Total Transactions</span>
              <h3 className="text-2xl font-black mt-1">{metrics.totalTxns} Records</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
              <FaHistory />
            </div>
          </div>
        </div>
      )}

      {/* MAIN TABLE & ADMIN FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Admin Manual Payment Form (Only for Admin) */}
        {!isRetailer && (
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="text-xl font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
                <FaPlus className="text-blue-600 text-sm" /> Add Payment Record
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Retailer *</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    name="retailer"
                    value={form.retailer}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Retailer</option>
                    {retailers.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.shopName || r.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Order</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                  >
                    <option value="">
                      {!form.retailer
                        ? "Select Retailer First"
                        : selectedRetailerOrders.length > 0
                        ? "-- Select Due Invoice / Order --"
                        : "No Due Invoices for this Retailer"}
                    </option>
                    {selectedRetailerOrders.map((o) => {
                      const orderTotal = Number(o.finalAmount || o.totalAmount || 0);
                      const orderPaid = orderPaidMap[o._id] || 0;
                      const remainingDue = Math.max(0, Math.round((orderTotal - orderPaid) * 100) / 100);
                      const paidLabel = orderPaid > 0 ? ` | Already Paid: ₹${orderPaid.toLocaleString("en-IN")}` : "";
                      return (
                        <option key={o._id} value={o._id}>
                          #{o.invoiceNumber || o.orderNumber} — Total Bill: ₹{orderTotal.toLocaleString("en-IN")}{paidLabel} → Remaining Balance Due: ₹{remainingDue.toLocaleString("en-IN")}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount *</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Status</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {paymentStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reference No.</label>
                  <input
                    type="text"
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                    name="referenceNumber"
                    value={form.referenceNumber}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow"
                >
                  {saving ? "Saving..." : "Save Payment Record"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Payment History Table (Full Width for Retailer, 8 cols for Admin) */}
        <div className={isRetailer ? "lg:col-span-12" : "lg:col-span-8"}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {isRetailer ? "My Payment History & Timeline" : "Agency Payment Records"}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                {filteredPayments.length} Records
              </span>
            </div>

            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-4">Retailer</th>
                    <th className="p-4">Order / Txn Ref</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Method</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                        No payment records found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => {
                      const statusVal = payment.status || payment.paymentStatus || "Pending";
                      return (
                        <tr key={payment._id} className="hover:bg-blue-50/50 transition">
                          <td className="p-4 font-bold text-slate-800">
                            {payment.retailer?.shopName || payment.retailer?.fullName || currentUser.fullName}
                          </td>
                          <td className="p-4 font-mono text-xs font-bold text-slate-600">
                            {payment.order?.invoiceNumber || payment.order?.orderNumber || payment.referenceNumber || "-"}
                          </td>
                          <td className="p-4 text-right font-extrabold text-green-600">
                            ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-4 text-center font-medium text-slate-700">
                            {payment.paymentMethod}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                statusVal.toLowerCase() === "approved" || statusVal.toLowerCase() === "paid"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : statusVal.toLowerCase() === "rejected"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              }`}
                            >
                              {statusVal}
                            </span>
                          </td>
                          <td className="p-4 text-center text-xs text-slate-500 font-medium">
                            {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-4 text-center">
                            {!isRetailer && statusVal.toLowerCase() === "pending" ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => updateStatus(payment._id, "Approved")}
                                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700 min-h-[38px]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(payment._id, "Rejected")}
                                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-700 min-h-[38px]"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-semibold">Verified ✔</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Payment Cards (< 768px) */}
            <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-medium">
                  No payment records found.
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const statusVal = payment.status || payment.paymentStatus || "Pending";
                  return (
                    <div
                      key={payment._id}
                      className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {payment.retailer?.shopName || payment.retailer?.fullName || currentUser.fullName}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-600">
                          {payment.order?.invoiceNumber ? `#${payment.order.invoiceNumber}` : payment.referenceNumber || "Txn Ref"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Method</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">{payment.paymentMethod}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Amount Received</span>
                          <span className="font-extrabold text-emerald-600 text-base">
                            ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                            statusVal.toLowerCase() === "approved" || statusVal.toLowerCase() === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : statusVal.toLowerCase() === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {statusVal}
                        </span>

                        {!isRetailer && statusVal.toLowerCase() === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(payment._id, "Approved")}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm min-h-[44px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(payment._id, "Rejected")}
                              className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm min-h-[44px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">Verified ✔</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        order={selectedOrderForGateway}
        amount={form.amount}
        retailerId={currentUser._id}
        onPaymentSuccess={loadAll}
      />

      {/* Admin Bank & QR Code Settings Modal */}
      {isAdminSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-lg border border-amber-500/30">
                  <FaQrcode />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">UPDATE ADMIN BANK & QR DETAILS</h3>
                  <p className="text-xs text-slate-400">Modify payee name, bank account, IFSC & upload official PhonePe QR image</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdminSettings} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Official Admin Payee Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                    value={adminSettings.adminPayee || ""}
                    onChange={(e) => setAdminSettings({ ...adminSettings, adminPayee: e.target.value })}
                    placeholder="e.g. B UPENDER REDDY"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Admin PhonePe / UPI VPA ID
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                    value={adminSettings.upiVpa || ""}
                    onChange={(e) => setAdminSettings({ ...adminSettings, upiVpa: e.target.value })}
                    placeholder="e.g. bupenderreddy@ybl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    value={adminSettings.bankName || ""}
                    onChange={(e) => setAdminSettings({ ...adminSettings, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    value={adminSettings.accountName || ""}
                    onChange={(e) => setAdminSettings({ ...adminSettings, accountName: e.target.value })}
                    placeholder="e.g. B UPENDER REDDY (BEEREDDY AGENCY)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                    value={adminSettings.accountNumber || ""}
                    onChange={(e) => setAdminSettings({ ...adminSettings, accountNumber: e.target.value })}
                    placeholder="e.g. 40982341902"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-mono uppercase font-bold"
                    value={adminSettings.ifsc || ""}
                    onChange={(e) => setAdminSettings({ ...adminSettings, ifsc: e.target.value })}
                    placeholder="e.g. SBIN0020145"
                  />
                </div>
              </div>

              {/* QR Image Upload Field */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <label className="block text-xs font-extrabold uppercase text-slate-700">
                  Official PhonePe / GPay QR Code Image
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <img
                    src={qrFile ? URL.createObjectURL(qrFile) : adminSettings.qrImage || "/admin_qr.jpg"}
                    alt="Admin QR Preview"
                    className="w-20 h-24 object-contain rounded-xl bg-black border border-slate-300 shadow-sm"
                  />
                  <div className="space-y-1 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setQrFile(e.target.files[0])}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400">
                      Upload your official PhonePe, GPay or Paytm QR image (PNG, JPG, JPEG)
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdminSettingsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-7 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  {savingSettings ? "Saving Settings..." : "Save & Update Details Now"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}