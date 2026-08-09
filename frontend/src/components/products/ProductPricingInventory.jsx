import React from "react";

export default function ProductPricingInventory({ formData, handleChange }) {
  const isMrpInvalid = Number(formData.mrp) > 0 && Number(formData.sellingPrice) > 0 && Number(formData.mrp) < Number(formData.sellingPrice);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-extrabold text-slate-800">
          Pricing, HSN & Inventory Rules
        </h2>
        {isMrpInvalid && (
          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full animate-pulse">
            ⚠️ MRP cannot be less than Selling Price
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 text-sm text-slate-700">
        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Purchase Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-mono font-bold"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Standard Selling Price (1-20 Units) (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-mono font-bold text-blue-700"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-amber-700">
            Tier 2 Bulk Price (21-100 Units) (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="bulkTier2Price"
            value={formData.bulkTier2Price}
            onChange={handleChange}
            placeholder="e.g. ₹440"
            className="w-full border border-amber-300 bg-amber-50/50 rounded-xl p-2.5 outline-none focus:border-amber-500 font-mono font-bold text-amber-800"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-emerald-700">
            Tier 3 Truckload Price (100+ Units) (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="bulkTier3Price"
            value={formData.bulkTier3Price}
            onChange={handleChange}
            placeholder="e.g. ₹410"
            className="w-full border border-emerald-300 bg-emerald-50/50 rounded-xl p-2.5 outline-none focus:border-emerald-500 font-mono font-bold text-emerald-800"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            MRP (Maximum Retail Price) (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="mrp"
            value={formData.mrp}
            onChange={handleChange}
            required
            className={`w-full border rounded-xl p-2.5 outline-none font-mono font-bold ${
              isMrpInvalid ? "border-red-500 bg-red-50 text-red-700" : "border-slate-300 focus:border-blue-500"
            }`}
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            GST Tax Percentage (%) *
          </label>
          <select
            name="gst"
            value={formData.gst}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-bold"
          >
            <option value={0}>0% (Exempt)</option>
            <option value={5}>5% GST</option>
            <option value={12}>12% GST</option>
            <option value={18}>18% GST (Standard Tile Adhesives)</option>
            <option value={28}>28% GST</option>
          </select>
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            HSN Code (Tax Code)
          </label>
          <input
            type="text"
            name="hsnCode"
            value={formData.hsnCode || ""}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 font-mono outline-none focus:border-blue-500"
            placeholder="e.g. 3506 91 90"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Current Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-bold"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Minimum Stock Threshold Alert *
          </label>
          <input
            type="number"
            min="0"
            name="minimumStock"
            value={formData.minimumStock}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-bold text-amber-700"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Triggers Low Stock Alert when inventory falls below this limit</span>
        </div>
      </div>
    </div>
  );
}