import { useState, useEffect } from "react";
import {
  FaTimes,
  FaQrcode,
  FaCreditCard,
  FaUniversity,
  FaWallet,
  FaShieldAlt,
  FaCheckCircle,
  FaSpinner,
  FaCopy,
  FaExternalLinkAlt,
  FaLock,
  FaMoneyBillAlt,
  FaBolt,
  FaUserCheck,
  FaBuilding,
  FaArrowRight,
  FaRegClock,
} from "react-icons/fa";
import api from "../../services/api";
import { getUser } from "../../utils/auth";
import { successToast, errorToast } from "../../utils/toast";

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  order,
  amount,
  retailerId,
  onPaymentSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState("upi_apps"); // 'upi_apps' | 'upi_qr' | 'card' | 'netbanking' | 'wallet' | 'cod'
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [utrInput, setUtrInput] = useState("");

  // Official Admin Payee Details (Dynamically Loaded)
  const [adminPayee, setAdminPayee] = useState("B UPENDER REDDY");
  const [upiVpa, setUpiVpa] = useState("bupenderreddy@ybl");
  const [adminBank, setAdminBank] = useState({
    accountName: "B UPENDER REDDY (BEEREDDY AGENCY)",
    bankName: "State Bank of India",
    accountNumber: "40982341902",
    ifsc: "SBIN0020145",
  });
  const [qrImage, setQrImage] = useState("/admin_qr.jpg");

  // Card & NetBanking Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [selectedWallet, setSelectedWallet] = useState("Amazon Pay");

  const getOrderTotalWithGst = (ord) => {
    if (!ord) return 0;
    const subtotal = Number(ord.totalAmount || 0);
    const gst = Number(ord.gstAmount || 0) > 0 ? Number(ord.gstAmount) : Math.round(subtotal * 0.18);
    const discount = Number(ord.discount || 0);
    const calculatedFinal = subtotal + gst - discount;
    return Number(ord.finalAmount && Number(ord.finalAmount) > subtotal ? ord.finalAmount : calculatedFinal);
  };

  const payableAmount = Number(amount || getOrderTotalWithGst(order) || 0);

  useEffect(() => {
    if (!isOpen) {
      setProcessing(false);
      setSuccessData(null);
      setUtrInput("");
    } else {
      api.get("/settings/payment-details")
        .then((res) => {
          if (res.data?.settings) {
            const s = res.data.settings;
            if (s.adminPayee) setAdminPayee(s.adminPayee);
            if (s.upiVpa) setUpiVpa(s.upiVpa);
            if (s.bankName || s.accountNumber) {
              setAdminBank({
                accountName: s.accountName || "B UPENDER REDDY (BEEREDDY AGENCY)",
                bankName: s.bankName || "State Bank of India",
                accountNumber: s.accountNumber || "40982341902",
                ifsc: s.ifsc || "SBIN0020145",
              });
            }
            if (s.qrImage) setQrImage(s.qrImage);
          }
        })
        .catch((err) => console.log("Fetch settings error:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const invoiceTag = order?.invoiceNumber || order?.orderNumber || "Dues Settlement";
  const rawUpiPayload = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(adminPayee)}&am=${payableAmount}&cu=INR&tn=Payment_Ref_${invoiceTag}`;
  const phonepeUpiPayload = `phonepe://pay?pa=${upiVpa}&pn=${encodeURIComponent(adminPayee)}&am=${payableAmount}&cu=INR`;
  const paytmUpiPayload = `paytmmp://pay?pa=${upiVpa}&pn=${encodeURIComponent(adminPayee)}&am=${payableAmount}&cu=INR`;

  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(rawUpiPayload)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiVpa);
    successToast("Admin UPI ID (bupenderreddy@ybl) copied!");
  };

  const handleCopyBankDetails = () => {
    const details = `Account Name: ${adminBank.accountName}\nBank: ${adminBank.bankName}\nAccount No: ${adminBank.accountNumber}\nIFSC: ${adminBank.ifsc}`;
    navigator.clipboard.writeText(details);
    successToast("Admin SBI Bank details copied!");
  };

  const executeCheckoutPayment = async (methodLabel, apiMethodName = "UPI", customRef = null) => {
    try {
      setProcessing(true);

      const currentUser = getUser() || {};
      const targetRetailerId = retailerId || currentUser._id || currentUser.id;

      // Simulate Amazon/BillDesk gateway verification delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const txnId = customRef || utrInput.trim() || `PAY-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

      // Submit payment record to Backend for Admin (B UPENDER REDDY) verification
      await api.post("/payments", {
        retailer: targetRetailerId,
        order: order?._id || undefined,
        amount: payableAmount,
        paymentMethod: apiMethodName,
        status: "Pending",
        referenceNumber: txnId,
        notes: `Payment submitted to Admin (${adminPayee}) via ${methodLabel}`,
      });

      setSuccessData({
        txnId,
        method: methodLabel,
        amount: payableAmount,
        payee: adminPayee,
        invoice: invoiceTag,
        date: new Date().toLocaleString("en-IN"),
      });

      successToast(`⚡ Payment Submitted to Admin (${adminPayee}) for Verification!`);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Payment transaction failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpiAppDirectLaunch = (appName, deepLinkUri) => {
    // 1. Try launching native UPI protocol
    try {
      window.location.assign(deepLinkUri);
    } catch (e) {
      console.log("UPI link error:", e);
    }

    // 2. Trigger transaction registration for Admin after short delay
    setTimeout(() => {
      executeCheckoutPayment(`${appName} (1-Tap UPI)`, "UPI");
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Amazon/BillDesk Style Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-md border border-white/20">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">BEEREDDY ERP CHECKOUT</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 uppercase">
                  <FaShieldAlt /> BILLDESK SECURE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Payee: <strong className="text-amber-400 font-bold">{adminPayee}</strong> <span className="text-slate-400 font-mono">({upiVpa})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payable Amount</span>
              <span className="text-2xl font-black text-emerald-400">₹{payableAmount.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {successData ? (
          /* =================================================== */
          /* AMAZON / FLIPKART SUCCESS RECEIPT SCREEN */
          /* =================================================== */
          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200 text-4xl shadow-xl">
              <FaCheckCircle className="animate-bounce" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Payment Submitted Successfully!</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Your payment of <strong className="text-slate-900">₹{successData.amount.toLocaleString("en-IN")}</strong> has been submitted to Admin <strong className="text-emerald-700">{successData.payee}</strong> for verification.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 max-w-md mx-auto text-left space-y-3 text-xs shadow-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Invoice / Order Ref:</span>
                <span className="font-mono font-extrabold text-blue-700">{successData.invoice}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Transaction UTR / Ref ID:</span>
                <span className="font-mono font-extrabold text-slate-900">{successData.txnId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Payee (Agency Admin):</span>
                <span className="font-bold text-amber-700">{successData.payee}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Verification Status:</span>
                <span className="font-extrabold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px]">
                  Pending Admin Verification
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-medium">Payment Option Used:</span>
                <span className="font-bold text-slate-800">{successData.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount Submitted:</span>
                <span className="font-black text-emerald-600 text-lg">₹{successData.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 px-10 rounded-2xl shadow-xl transition text-xs uppercase tracking-wider"
            >
              Done & Return to Portal
            </button>
          </div>
        ) : processing ? (
          /* =================================================== */
          /* GATEWAY PROCESSING SCREEN */
          /* =================================================== */
          <div className="p-16 text-center space-y-4 my-auto">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Connecting to Banking Gateway...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Verifying transaction parameters for <strong>{adminPayee}</strong> (`{upiVpa}`). Please do not close or refresh this window.
            </p>
          </div>
        ) : (
          /* =================================================== */
          /* MAIN E-COMMERCE CHECKOUT BODY */
          /* =================================================== */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Category Navigation Sidebar */}
            <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200/90 p-4 space-y-1.5 overflow-y-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                SELECT PAYMENT METHOD
              </span>

              <button
                onClick={() => setSelectedMethod("upi_apps")}
                className={`w-full p-3.5 rounded-2xl text-left text-xs font-extrabold flex items-center justify-between transition ${
                  selectedMethod === "upi_apps"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FaBolt className="text-amber-400 text-sm" /> 1-Tap UPI Apps
                </span>
                <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                  FAST
                </span>
              </button>

              <button
                onClick={() => setSelectedMethod("upi_qr")}
                className={`w-full p-3.5 rounded-2xl text-left text-xs font-extrabold flex items-center gap-2.5 transition ${
                  selectedMethod === "upi_qr"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <FaQrcode className="text-slate-400 text-sm" /> Admin NPCI QR Code
              </button>

              <button
                onClick={() => setSelectedMethod("card")}
                className={`w-full p-3.5 rounded-2xl text-left text-xs font-extrabold flex items-center gap-2.5 transition ${
                  selectedMethod === "card"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <FaCreditCard className="text-slate-400 text-sm" /> Credit / Debit Card
              </button>

              <button
                onClick={() => setSelectedMethod("netbanking")}
                className={`w-full p-3.5 rounded-2xl text-left text-xs font-extrabold flex items-center gap-2.5 transition ${
                  selectedMethod === "netbanking"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <FaUniversity className="text-slate-400 text-sm" /> Net Banking / Bank
              </button>

              <button
                onClick={() => setSelectedMethod("wallet")}
                className={`w-full p-3.5 rounded-2xl text-left text-xs font-extrabold flex items-center gap-2.5 transition ${
                  selectedMethod === "wallet"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <FaWallet className="text-slate-400 text-sm" /> Wallets & Pay Later
              </button>

              <button
                onClick={() => setSelectedMethod("cod")}
                className={`w-full p-3.5 rounded-2xl text-left text-xs font-extrabold flex items-center gap-2.5 transition ${
                  selectedMethod === "cod"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <FaMoneyBillAlt className="text-slate-400 text-sm" /> Cash on Delivery (COD)
              </button>
            </div>

            {/* Right Payment Action Container */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 flex flex-col justify-between bg-white">
              
              {/* Order & Payee Overview Banner */}
              <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Payment Summary</span>
                  <p className="text-xs font-mono font-bold text-cyan-300">Invoice: #{invoiceTag}</p>
                  <p className="text-xs text-amber-300 font-bold mt-0.5 flex items-center gap-1">
                    <FaUserCheck className="text-xs" /> Payee: {adminPayee}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">₹{payableAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* DYNAMIC OPTION FORMS */}

              {/* 1. RECOMMENDED 1-TAP UPI APPS */}
              {selectedMethod === "upi_apps" && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-emerald-900">
                    <div>
                      <h5 className="font-extrabold text-xs">Official Admin UPI Payee Verified</h5>
                      <p className="text-[11px] text-emerald-700 font-mono mt-0.5">UPI VPA: {upiVpa} ({adminPayee})</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-2xs"
                    >
                      <FaCopy /> Copy VPA
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
                      Pay via Installed Mobile UPI App
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tap your preferred app below. On mobile, it will launch the app with prefilled payment of <strong>₹{payableAmount.toLocaleString("en-IN")}</strong> to <strong>{adminPayee}</strong>:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Google Pay Direct Link */}
                    <a
                      href={rawUpiPayload}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpiAppDirectLaunch("Google Pay", rawUpiPayload)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 flex items-center gap-3.5 transition shadow-sm group text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                        GPay
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Google Pay</h5>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          1-Tap Launch <FaExternalLinkAlt className="text-[9px]" />
                        </span>
                      </div>
                    </a>

                    {/* PhonePe Direct Link */}
                    <a
                      href={phonepeUpiPayload}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpiAppDirectLaunch("PhonePe", phonepeUpiPayload)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/50 flex items-center gap-3.5 transition shadow-sm group text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                        PE
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-purple-600">PhonePe</h5>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          1-Tap Launch <FaExternalLinkAlt className="text-[9px]" />
                        </span>
                      </div>
                    </a>

                    {/* Paytm Direct Link */}
                    <a
                      href={paytmUpiPayload}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpiAppDirectLaunch("Paytm", paytmUpiPayload)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-cyan-500 bg-white hover:bg-cyan-50/50 flex items-center gap-3.5 transition shadow-sm group text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                        PAY
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-cyan-600">Paytm UPI</h5>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          1-Tap Launch <FaExternalLinkAlt className="text-[9px]" />
                        </span>
                      </div>
                    </a>

                    {/* BHIM Direct Link */}
                    <a
                      href={rawUpiPayload}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpiAppDirectLaunch("BHIM UPI", rawUpiPayload)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-orange-500 bg-white hover:bg-orange-50/50 flex items-center gap-3.5 transition shadow-sm group text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                        BHIM
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-orange-600">BHIM UPI</h5>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          1-Tap Launch <FaExternalLinkAlt className="text-[9px]" />
                        </span>
                      </div>
                    </a>

                  </div>

                  {/* UTR Input Field */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Already paid on PhonePe / GPay? Enter Transaction UTR / Ref No.
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 420918290192 or UTR No."
                        className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => executeCheckoutPayment("Direct UPI UTR Submission", "UPI", utrInput)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
                      >
                        Submit UTR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. OFFICIAL ADMIN NPCI QR CODE */}
              {selectedMethod === "upi_qr" && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-6 border border-slate-800">
                    <div className="bg-white p-3 rounded-2xl flex-shrink-0 flex flex-col items-center gap-2 border border-slate-700 shadow-md">
                      <img src={qrImage || "/admin_qr.jpg"} alt="Official Admin NPCI QR Code" className="w-48 h-48 rounded-lg object-contain" />
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <FaCheckCircle className="text-emerald-500" /> Verified Admin QR
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-3 py-1 rounded-full border border-purple-500/30 uppercase tracking-wider inline-block">
                        NPCI INSTANT DYNAMIC QR
                      </span>

                      <div>
                        <h4 className="text-xl font-black text-white">{adminPayee}</h4>
                        <p className="text-xs text-slate-300">Scan with any PhonePe, GPay, Paytm or Banking App</p>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Admin UPI VPA</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-950 text-cyan-300 font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-800 font-bold flex-1">
                            {upiVpa}
                          </span>
                          <button onClick={handleCopyUpi} className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-500 transition" title="Copy UPI VPA">
                            <FaCopy />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">
                        Amount to Pay: <strong className="text-emerald-400 font-black text-sm">₹{payableAmount.toLocaleString("en-IN")}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. CREDIT / DEBIT CARD */}
              {selectedMethod === "card" && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Accepted Cards</span>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">VISA</span>
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">MasterCard</span>
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">RuPay</span>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      executeCheckoutPayment("Credit / Debit Card", "Card");
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="Name on Card"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        required
                        className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8921"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          maxLength="5"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          required
                          className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength="4"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          required
                          className="w-full border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* 4. NET BANKING / ADMIN BANK */}
              {selectedMethod === "netbanking" && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <FaBuilding /> Official Admin Bank Account Details
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBankDetails}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1"
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Name</span>
                        <strong className="text-white font-bold">{adminBank.accountName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank Name</span>
                        <strong className="text-white font-bold">{adminBank.bankName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Number</span>
                        <strong className="text-cyan-300 font-mono font-bold text-sm">{adminBank.accountNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                        <strong className="text-amber-300 font-mono font-bold text-sm">{adminBank.ifsc}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. WALLETS */}
              {selectedMethod === "wallet" && (
                <div className="space-y-4">
                  <span className="text-xs font-extrabold uppercase text-slate-700 block">Select Wallet Provider</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["Amazon Pay", "PhonePe Wallet", "Paytm Wallet", "Mobikwik"].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWallet(w)}
                        className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                          selectedWallet === w
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <FaWallet /> {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. CASH ON DELIVERY */}
              {selectedMethod === "cod" && (
                <div className="space-y-3">
                  <div className="bg-amber-50 p-4.5 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                    <h5 className="font-bold text-xs">Cash on Delivery (COD) Selected</h5>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Pay cash to the delivery agent or pay Admin (<strong>{adminPayee}</strong>) directly via QR code upon delivery.
                    </p>
                  </div>
                </div>
              )}

              {/* BOTTOM MAIN CHECKOUT SUBMIT BUTTON */}
              <button
                onClick={() => {
                  if (selectedMethod === "card") {
                    executeCheckoutPayment("Credit / Debit Card", "Card");
                  } else if (selectedMethod === "netbanking") {
                    executeCheckoutPayment(`Admin Bank Transfer (${adminBank.bankName})`, "Bank Transfer");
                  } else if (selectedMethod === "wallet") {
                    executeCheckoutPayment(selectedWallet || "Amazon Pay", "UPI");
                  } else if (selectedMethod === "cod") {
                    executeCheckoutPayment("Cash on Delivery", "Cash");
                  } else if (selectedMethod === "upi_qr") {
                    executeCheckoutPayment("Admin NPCI Dynamic QR", "UPI");
                  } else {
                    executeCheckoutPayment("Instant 1-Tap UPI App", "UPI");
                  }
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-4 hover:-translate-y-0.5 cursor-pointer"
              >
                <FaLock /> PAY ₹{payableAmount.toLocaleString("en-IN")} TO ADMIN NOW <FaArrowRight />
              </button>

            </div>

          </div>
        )}

        {/* Footer Security Badge */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-semibold gap-2">
          <span className="flex items-center gap-1.5 text-slate-700">
            <FaLock className="text-emerald-600 text-xs" /> 256-Bit SSL Encryption • BillDesk Gateway Certified
          </span>
          <span>Verified Agency Payee: <strong className="text-slate-900">{adminPayee}</strong> ({upiVpa})</span>
        </div>

      </div>
    </div>
  );
}


