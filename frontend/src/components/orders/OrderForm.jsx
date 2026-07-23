import { useEffect, useState } from "react";

import OrderItems from "./OrderItems";
import OrderSummary from "./OrderSummary";

export default function OrderForm({
  initialData,
  retailers,
  products,
  onSubmit,
  loading,
}) {

  const [form, setForm] = useState({
    retailer: "",
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    orderStatus: "Pending",
    remarks: "",
    items: [],
  });

  useEffect(() => {

    if (initialData) {

      setForm({
        retailer: initialData.retailer?._id || "",
        paymentMethod:
          initialData.paymentMethod || "Cash",
        paymentStatus:
          initialData.paymentStatus || "Pending",
        orderStatus:
          initialData.orderStatus || "Pending",
        remarks:
          initialData.remarks || "",
        items:
          initialData.items || [],
      });

    }

  }, [initialData]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleItemsChange = (items) => {

    setForm((prev) => ({
      ...prev,
      items,
    }));

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const totalAmount = form.items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.price || 0),
      0
    );

    onSubmit({
      ...form,
      totalAmount,
    });

  };
    return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* Order Details */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2 font-medium">
            Retailer
          </label>

          <select
            name="retailer"
            value={form.retailer}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">
              Select Retailer
            </option>

            {retailers.map((retailer) => (
              <option
                key={retailer._id}
                value={retailer._id}
              >
                {retailer.shopName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Payment Method
          </label>

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Credit</option>
          </select>
        </div>

      </div>

      {/* Status */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block mb-2 font-medium">
            Payment Status
          </label>

          <select
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option>Pending</option>
            <option>Paid</option>
            <option>Partial</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Order Status
          </label>

          <select
            name="orderStatus"
            value={form.orderStatus}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Packed</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

      </div>

      {/* Remarks */}

      <div>
        <label className="block mb-2 font-medium">
          Remarks
        </label>

        <textarea
          name="remarks"
          rows="3"
          value={form.remarks}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Optional remarks..."
        />
      </div>

      {/* Order Items */}

      <OrderItems
        items={form.items}
        products={products}
        onChange={handleItemsChange}
      />

      {/* Summary */}

      <OrderSummary
        items={form.items}
      />

      {/* Save Button */}

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : initialData
            ? "Update Order"
            : "Create Order"}
        </button>

      </div>

    </form>
  );

}