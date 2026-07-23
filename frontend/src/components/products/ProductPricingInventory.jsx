import React from "react";

export default function ProductPricingInventory({
  formData,
  handleChange,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">

      <h2 className="text-xl font-bold mb-6">
        Pricing & Inventory
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2">
            Purchase Price *
          </label>

          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Selling Price *
          </label>

          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            MRP *
          </label>

          <input
            type="number"
            name="mrp"
            value={formData.mrp}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            GST %
          </label>

          <input
            type="number"
            name="gst"
            value={formData.gst}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Stock
          </label>

          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Minimum Stock
          </label>

          <input
            type="number"
            name="minimumStock"
            value={formData.minimumStock}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>
    </div>
  );
}