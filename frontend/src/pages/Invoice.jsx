import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPrint,
  FaFileInvoice,
  FaCheckCircle,
} from "react-icons/fa";

import orderService from "../services/orderService";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl font-bold text-slate-700">
        Loading Tax Invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-slate-600">
        Invoice not found.
      </div>
    );
  }

  // Calculate Subtotal & Tax Amounts
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  ) || Number(order.totalAmount || 0);

  // If gstAmount is saved on order, use it. Otherwise calculate 18% GST (9% CGST + 9% SGST)
  const gstAmount = Number(order.gstAmount || 0) > 0 
    ? Number(order.gstAmount) 
    : Math.round(subtotal * 0.18);

  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const discountAmount = Number(order.discount || 0);

  const grandTotal = Number(
    order.finalAmount && Number(order.finalAmount) > subtotal
      ? order.finalAmount
      : subtotal + gstAmount - discountAmount
  );

  // Determine Payment Totals & Balance
  const isPaid = order.paymentStatus === "Paid";
  const totalPaid = isPaid 
    ? grandTotal 
    : Number(order.totalPaidAmount || 0);

  const balanceLeft = isPaid ? 0 : Math.max(0, grandTotal - totalPaid);

  const handleBack = () => {
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/invoices");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-4 print:py-0 print:bg-white print:min-h-0">
      
      {/* Embedded CSS for Exact Single A4 Page Print Fit */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .a4-print-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          table {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-3 print:px-0">

        {/* Action Buttons Header */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            onClick={printInvoice}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
          >
            <FaPrint />
            Print Tax Invoice (A4 Fit)
          </button>
        </div>

        {/* Invoice Printable A4 Card */}
        <div className="a4-print-card bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-200 text-slate-800">

          {/* Company Brand & Invoice Details Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-3 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-sm print:bg-blue-600">
                  B
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    BEEREDDY AGENCY
                  </h1>
                  <p className="text-slate-500 font-semibold text-[10px] mt-0.5">
                    Authorized Distributor of V-Bond Tile Adhesives & Construction Chemicals
                  </p>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5 font-medium leading-tight">
                <p className="font-bold text-slate-800">H.No: 4-12, Main Road, Nalgonda, Telangana - 508001</p>
                <p>Phone: +91 98765 43210 / +91 63020 39120 | Email: info@beereddyagency.com</p>
                <p className="font-mono text-indigo-700 font-bold">GSTIN: 36ABCDE1234F1Z5</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1 border border-blue-100">
                Official Tax Invoice
              </span>

              <h2 className="text-xl font-black text-slate-800 leading-none">
                TAX INVOICE
              </h2>

              <div className="mt-2 text-[11px] space-y-0.5 text-slate-700">
                <p>
                  <span className="font-bold text-slate-500 uppercase">Invoice No:</span>{" "}
                  <strong className="font-mono text-xs text-blue-700">{order.invoiceNumber || `INV-${order.orderNumber}`}</strong>
                </p>
                <p>
                  <span className="font-bold text-slate-500 uppercase">Order Ref:</span>{" "}
                  <strong className="font-mono text-slate-800">{order.orderNumber}</strong>
                </p>
                <p>
                  <span className="font-bold text-slate-500 uppercase">Date:</span>{" "}
                  <strong className="text-slate-800">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Bill To & Fulfillment Details Grid */}
          <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px]">
            <div>
              <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                Bill To (Retailer Details)
              </h3>
              <p className="font-black text-slate-900 text-xs">
                {order.retailer?.shopName || "Retailer Partner"}
              </p>
              <p className="font-bold text-slate-700">
                {order.retailer?.fullName}
              </p>
              <p className="text-slate-600">
                Contact: {order.retailer?.phone || "N/A"} | Address: {order.deliveryAddress || order.retailer?.address || "Store Address"}
              </p>
            </div>

            <div className="text-right space-y-0.5 text-slate-700">
              <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                Fulfillment & Payment Status
              </h3>
              <p>
                <span className="font-semibold text-slate-500">Payment Method:</span>{" "}
                <strong className="text-slate-800">{order.paymentMethod || "COD"}</strong>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Payment Status:</span>{" "}
                <span className={`inline-block px-2 py-0.2 rounded-full font-extrabold text-[10px] ${
                  isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {order.paymentStatus || "Pending"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Order Status:</span>{" "}
                <strong className="text-slate-800 uppercase">{order.orderStatus || "Approved"}</strong>
              </p>
            </div>
          </div>

          {/* Compact Product Items Table */}
          <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Product Description</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Total (Excl. Tax)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {order.items.map((item, index) => {
                  const itemPrice = Number(item.price || 0);
                  const itemQty = Number(item.quantity || 1);
                  const itemTotal = itemPrice * itemQty;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {item.productName}
                        {item.sku && <span className="inline-block ml-2 text-[9px] text-slate-400 font-mono uppercase">SKU: {item.sku}</span>}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">{itemQty}</td>
                      <td className="py-2 px-3 text-right text-slate-700">₹{itemPrice.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">₹{itemTotal.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Tax Breakdown Box */}
          <div className="flex justify-end mt-3">
            <div className="w-full sm:w-80 bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-200">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-bold text-slate-800">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-600 pt-0.5">
                <span>CGST (9%)</span>
                <span className="font-bold text-slate-700">₹{cgstAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-200">
                <span>SGST (9%)</span>
                <span className="font-bold text-slate-700">₹{sgstAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-800 font-bold py-0.5 border-b border-slate-200">
                <span>Total GST (18%)</span>
                <span className="text-blue-700">₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold py-0.5 border-b border-slate-200">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between py-1 text-sm font-black text-slate-900 border-b-2 border-slate-900">
                <span>Grand Total (Incl. GST)</span>
                <span className="text-blue-800">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between py-1 text-[11px] font-extrabold text-emerald-700 border-b border-slate-200">
                <span>Total Amount Paid</span>
                <span>₹{totalPaid.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between py-1 text-xs font-black pt-1">
                <span>Balance Left to Pay</span>
                <span className={balanceLeft > 0 ? "text-rose-600" : "text-emerald-600 flex items-center gap-1"}>
                  {balanceLeft > 0 ? `₹${balanceLeft.toLocaleString("en-IN")}` : "₹0 (Fully Settled)"}
                  {balanceLeft === 0 && <FaCheckCircle className="text-[10px]" />}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Receipts History Table (if payments exist) */}
          {Array.isArray(order.paymentHistory) && order.paymentHistory.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-200 space-y-1">
              <h3 className="font-black text-[10px] uppercase text-slate-800 tracking-wider flex items-center justify-between">
                <span>💳 Payments Received Receipts</span>
                <span className="text-[9px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  {order.paymentHistory.length} Verified Receipt(s)
                </span>
              </h3>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead className="bg-slate-200/80 text-slate-700 font-extrabold uppercase">
                    <tr>
                      <th className="p-1.5">Date</th>
                      <th className="p-1.5">Method</th>
                      <th className="p-1.5">Reference / UTR No.</th>
                      <th className="p-1.5 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {order.paymentHistory.map((p, idx) => (
                      <tr key={p._id || idx}>
                        <td className="p-1.5 text-slate-600">
                          {new Date(p.verifiedAt || p.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-1.5 font-bold text-slate-800">
                          {p.paymentMethod || "UPI"}
                        </td>
                        <td className="p-1.5 font-mono font-bold text-blue-700">
                          {p.referenceNumber || "-"}
                        </td>
                        <td className="p-1.5 text-right font-black text-emerald-600">
                          +₹{Number(p.amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Remarks Section */}
          {order.remarks && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-[10px] uppercase text-slate-500 mb-0.5">
                Remarks
              </h3>
              <div className="border rounded-lg p-2 bg-slate-50 text-[10px] text-slate-700 font-medium">
                {order.remarks}
              </div>
            </div>
          )}

          {/* Terms & Conditions and Authorized Signature Footer */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200 text-[10px]">
            <div>
              <h3 className="font-bold text-[10px] uppercase text-slate-700 mb-1">
                Terms & Conditions
              </h3>
              <ul className="text-slate-500 space-y-0.5 list-disc list-inside font-medium leading-tight">
                <li>Goods once sold will not be taken back.</li>
                <li>Please verify product quantity upon delivery.</li>
                <li>Subject to Hyderabad / Nalgonda jurisdiction.</li>
              </ul>
            </div>

            <div className="text-right flex flex-col justify-end items-end">
              <div className="border-t border-slate-400 pt-0.5 px-6 text-[10px] font-bold text-slate-700 uppercase">
                Authorized Signature (Beereddy Agency)
              </div>
            </div>
          </div>

          <div className="text-center mt-3 pt-2 border-t border-slate-100">
            <h2 className="text-base font-black text-blue-700 tracking-tight leading-none">
              Thank You For Your Business!
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Beereddy Agency Helpdesk: +91 63020 39120 / +91 98765 43210
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}