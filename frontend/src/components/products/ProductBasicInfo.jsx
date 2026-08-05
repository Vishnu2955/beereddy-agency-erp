import React, { useState, useEffect } from "react";
import api from "../../services/api";

const DEFAULT_CAT_LIST = [
  "Tile Adhesives",
  "Tile Grouts",
  "Waterproofing",
  "Chemicals",
  "Accessories",
];

export default function ProductBasicInfo({ formData, handleChange }) {
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CAT_LIST);

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        if (res.data.success && res.data.categories) {
          const names = res.data.categories.map((c) => c.name);
          setCategoriesList(Array.from(new Set([...DEFAULT_CAT_LIST, ...names])));
        }
      })
      .catch((_) => {});
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
      <h2 className="text-lg font-extrabold text-slate-800 border-b pb-3">
        Basic Product Details
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 text-sm text-slate-700">
        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Product Name *
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-semibold text-slate-800"
            placeholder="e.g. V-Bond Platinum Tile Adhesive"
            required
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Brand *
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500"
            placeholder="Brand (e.g. V-Bond)"
            required
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-semibold"
            required
          >
            <option value="">-- Select Category --</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            SKU (Stock Keeping Unit)
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 uppercase font-mono outline-none focus:border-blue-500"
            placeholder="VB-PLAT-20KG"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Barcode / EAN
          </label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode || ""}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 font-mono outline-none focus:border-blue-500"
            placeholder="8901234567890"
          />
        </div>

        <div>
          <label className="block mb-1.5 font-bold text-slate-800">
            Unit of Measurement *
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-semibold"
            required
          >
            <option value="BAG">BAG (20KG / 50KG)</option>
            <option value="BOX">BOX</option>
            <option value="PCS">PCS</option>
            <option value="KG">KG</option>
            <option value="LITER">LITER / BUCKET</option>
            <option value="CAN">CAN / PAIL</option>
          </select>
        </div>
      </div>
    </div>
  );
}