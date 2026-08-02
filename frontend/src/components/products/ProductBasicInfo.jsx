import React from "react";

export default function ProductBasicInfo({
  formData,
  handleChange,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">
        Product Information
      </h2>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block mb-2 font-medium">
            Product Name *
          </label>

          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Enter Product Name"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Brand *
          </label>

          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Brand (e.g. V-Bond)"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Category *
          </label>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            placeholder="Category (e.g. Tile Adhesives)"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            SKU (Optional)
          </label>

          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 uppercase"
            placeholder="Optional SKU (e.g. VB-MAX-20KG)"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Unit *
          </label>

          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="PCS">PCS</option>
            <option value="BAG">BAG (20KG/50KG)</option>
            <option value="BOX">BOX</option>
            <option value="KG">KG</option>
            <option value="LITER">LITER</option>
          </select>
        </div>
      </div>
    </div>
  );
}