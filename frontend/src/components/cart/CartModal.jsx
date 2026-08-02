import { useState } from "react";
import { FaTimes, FaTrash, FaQrcode, FaCheckCircle, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import api from "../../services/api";
import { getUser } from "../../utils/auth";
import { successToast, errorToast } from "../../utils/toast";

export default function CartModal({ isOpen, onClose, cart, setCart, onOrderPlaced }) {
  const user = getUser();
  const [paymentMethod, setPaymentMethod] = useState("QR / UPI Payment");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [txnId, setTxnId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [upiVpaInput, setUpiVpaInput] = useState("bupenderreddy@ybl");
  const [testAmount, setTestAmount] = useState(null);

  if (!isOpen) return null;

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const subtotalAmount = cart.reduce(
    (sum, item) => sum + Number(item.sellingPrice || 0) * item.quantity,
    0
  );

  const gstAmount = Math.round(subtotalAmount * 0.18); // Standard 18% GST
  const grandTotalAmount = subtotalAmount + gstAmount;

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      return errorToast("Your cart is empty.");
    }

    if (!deliveryAddress.trim()) {
      return errorToast("Please enter a valid delivery address.");
    }

    try {
      setLoading(true);

      const itemsPayload = cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const isUpi = paymentMethod === "QR / UPI Payment";

      const res = await api.post("/orders", {
        items: itemsPayload,
        gstAmount: gstAmount,
        paymentMethod: isUpi ? "UPI/QR Code" : paymentMethod,
        paymentStatus: "Pending",
        deliveryAddress: deliveryAddress,
        remarks: `${notes} ${txnId ? `[Txn Ref: ${txnId}]` : "[Payment Submitted - Pending Admin Verification]"}`.trim(),
      });

      if (res.data.success) {
        successToast("Order placed successfully! Admin will verify payment and process your order.");
        setCart([]);
        if (onOrderPlaced) onOrderPlaced();
        onClose();
      }
    } catch (err) {
      console.error(err);
      errorToast(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const payAmount = testAmount !== null ? testAmount : grandTotalAmount;
  const upiVpa = upiVpaInput.trim() || "beereddyagency@ybl";
  const upiName = "Beereddy Agency ERP";
  const rawUpiPayload = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(upiName)}&am=${payAmount}&cu=INR`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(rawUpiPayload)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaShoppingBag className="text-xl" />
            <h2 className="text-xl font-bold">Your Cart & Checkout</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <FaShoppingBag className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="font-semibold text-lg">Your shopping cart is empty</p>
              <p className="text-sm">Browse products and add items to place an order.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Cart Items</h3>
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between border rounded-xl p-3 bg-gray-50 hover:bg-white transition">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-xs">
                        {item.productName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.productName}</h4>
                      <p className="text-xs text-gray-500">₹{Number(item.sellingPrice).toLocaleString("en-IN")} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, -1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold transition text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const newQty = isNaN(val) || val < 1 ? 1 : val;
                          setCart((prev) =>
                            prev.map((i) => (i._id === item._id ? { ...i, quantity: newQty } : i))
                          );
                        }}
                        className="w-14 text-center text-xs font-bold text-gray-800 bg-white border-x border-gray-200 py-1 outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold transition text-sm"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-gray-800 text-sm min-w-[70px] text-right">
                      ₹{Number(item.sellingPrice * item.quantity).toLocaleString("en-IN")}
                    </span>

                    <button onClick={() => removeItem(item._id)} className="text-red-500 hover:text-red-700 p-1">
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Financial Calculation Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm mt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. Tax):</span>
                  <span className="font-bold text-slate-800">₹{Number(subtotalAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-bold text-blue-700">+₹{Number(gstAmount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Amount Payable (Incl. GST):</span>
                  <span className="text-2xl font-black text-blue-700">
                    ₹{Number(grandTotalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <form onSubmit={handleCheckout} className="space-y-5 border-t pt-5">

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={2}
                  required
                  placeholder="Enter full delivery shop/home address"
                  className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Method Options */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QR / UPI Payment")}
                    className={`p-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition ${
                      paymentMethod === "QR / UPI Payment"
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FaQrcode /> QR / UPI Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Cash on Delivery")}
                    className={`p-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition ${
                      paymentMethod === "Cash on Delivery"
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              {/* QR / UPI Display Area */}
              {paymentMethod === "QR / UPI Payment" && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-slate-800">
                  <div className="bg-white p-2 rounded-xl shadow-lg flex-shrink-0 flex flex-col items-center gap-2">
                    <img src="/admin_qr.jpg" alt="Official Admin QR Code" className="w-40 h-40 rounded-lg object-contain" />
                    <a
                      href={rawUpiPayload}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-2 py-1 rounded-lg w-full text-center shadow"
                    >
                      📱 Open UPI App
                    </a>
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                        <FaCheckCircle /> Scan with PhonePe / GPay / Paytm
                      </span>
                      <button
                        type="button"
                        onClick={() => setTestAmount(testAmount === 1 ? null : 1)}
                        className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full border border-yellow-500/30 transition"
                      >
                        {testAmount === 1 ? "Reset Order Amount" : "⚡ Set ₹1 Test Amount"}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs text-slate-400">Payee UPI VPA ID (Editable):</label>
                      <input
                        type="text"
                        value={upiVpaInput}
                        onChange={(e) => setUpiVpaInput(e.target.value)}
                        placeholder="e.g. beereddyagency@ybl"
                        className="w-full max-w-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-blue-300 font-mono font-bold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs text-slate-400 mb-1">Transaction Ref / UTR No. (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 329847192847"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Special delivery instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 text-base"
              >
                {loading ? "Placing Order..." : "Confirm & Place Order"} <FaArrowRight />
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
