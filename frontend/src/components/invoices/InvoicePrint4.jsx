import React from "react";

export default function InvoicePrint4({ order }) {
  if (!order) return null;

  const shopName = order.retailer?.shopName || order.retailer?.fullName || "Retailer Partner";
  const phone = order.retailer?.phone || "";
  const address = order.retailer?.address || "Telangana, India";
  const gstNumber = order.retailer?.gstNumber || "N/A";
  const items = order.items || [];
  const subtotal = Number(order.totalAmount || 0);
  const gst = Number(order.gstAmount || 0) > 0 ? Number(order.gstAmount) : Math.round(subtotal * 0.18);
  const discount = Number(order.discount || 0);
  const grandTotal = Number(order.finalAmount || (subtotal + gst - discount));

  // Render mini single receipt
  const MiniReceipt = ({ label }) => (
    <div className="border border-slate-400 p-3 rounded-lg flex flex-col justify-between h-[135mm] bg-white text-slate-900 text-[10px] space-y-1.5 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-300 pb-1.5">
        <div>
          <h2 className="text-xs font-black uppercase text-blue-900 leading-tight">BEEREDDY AGENCY</h2>
          <p className="text-[9px] text-slate-600 font-semibold">V Bond Tile Adhesives Distributor</p>
          <p className="text-[8px] text-slate-500">Ph: +91 9876543210 • GSTIN: 36ABCDE1234F1Z5</p>
        </div>
        <div className="text-right font-mono">
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px] font-bold border border-slate-300 block">
            {label}
          </span>
          <span className="font-extrabold text-[10px] text-slate-900 block mt-0.5">
            #{order.invoiceNumber || order.orderNumber || "INV-001"}
          </span>
          <span className="text-[8px] text-slate-500 block">
            {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-slate-50 p-1.5 rounded border border-slate-200 grid grid-cols-2 text-[9px]">
        <div>
          <span className="font-bold block text-slate-500 text-[8px]">BILLED TO</span>
          <strong className="text-slate-900 block truncate">{shopName}</strong>
          <span className="text-slate-600 block truncate">{address}</span>
        </div>
        <div className="text-right font-mono">
          <span className="text-slate-500 text-[8px] block">CONTACT / GST</span>
          <span className="text-slate-800 block">{phone}</span>
          <span className="text-slate-600 block">GST: {gstNumber}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-700 text-[8px] font-extrabold uppercase border-b border-slate-300">
              <th className="p-1">Item Description</th>
              <th className="p-1 text-center">Qty</th>
              <th className="p-1 text-right">Rate</th>
              <th className="p-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.slice(0, 4).map((item, idx) => (
              <tr key={idx} className="text-[9px]">
                <td className="p-1 font-bold truncate max-w-[110px]">
                  {item.product?.productName || item.productName || "Tile Adhesive"}
                </td>
                <td className="p-1 text-center font-bold">{item.quantity}</td>
                <td className="p-1 text-right font-mono">₹{item.price}</td>
                <td className="p-1 text-right font-extrabold font-mono">
                  ₹{item.quantity * item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-slate-300 pt-1 flex justify-between items-center bg-slate-100 p-1.5 rounded">
        <div>
          <span className="text-[8px] font-bold text-slate-500 block uppercase">Payment Mode</span>
          <strong className="text-[9px] text-slate-800 uppercase">{order.paymentMethod || "Cash/Bank"}</strong>
        </div>
        <div className="text-right font-mono">
          <span className="text-[8px] font-bold text-slate-500 block">GRAND TOTAL (INC. 18% GST)</span>
          <strong className="text-xs font-black text-blue-900">
            ₹{grandTotal.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white font-sans print:p-0">
      {/* 2x2 Grid fitting exactly on single A4 Sheet */}
      <div className="grid grid-cols-2 gap-3 max-w-[210mm] mx-auto min-h-[297mm] p-2 bg-white">
        <MiniReceipt label="Original Copy" />
        <MiniReceipt label="Duplicate Copy" />
        <MiniReceipt label="Triplicate Copy" />
        <MiniReceipt label="Transporter Copy" />
      </div>
    </div>
  );
}
