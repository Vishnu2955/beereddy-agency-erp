import { useState } from "react";

import ProductBasicInfo from "./ProductBasicInfo";
import ProductPricingInventory from "./ProductPricingInventory";
import ImageUpload from "./ImageUpload";

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
  onCancel,
}) {

  const [formData, setFormData] = useState({
    productName: initialData?.productName || "",
    brand: initialData?.brand || "V-Bond",
    category: initialData?.category || "",
    sku: initialData?.sku || "",
    purchasePrice: initialData?.purchasePrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
    mrp: initialData?.mrp || 0,
    gst: initialData?.gst || 18,
    stock: initialData?.stock || 0,
    minimumStock: initialData?.minimumStock || 5,
    unit: initialData?.unit || "BAG",
    description: initialData?.description || "",
    image: initialData?.image || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductBasicInfo
        formData={formData}
        handleChange={handleChange}
      />

      <ProductPricingInventory
        formData={formData}
        handleChange={handleChange}
      />

      <ImageUpload
        formData={formData}
        setFormData={setFormData}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <label className="font-semibold block mb-2">
          Description (Optional)
        </label>

        <textarea
          rows="4"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          placeholder="Product features, usage guidelines, and specifications..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition shadow-md cursor-pointer disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}