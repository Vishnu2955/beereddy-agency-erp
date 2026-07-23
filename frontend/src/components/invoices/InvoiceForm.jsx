import { useEffect, useState } from "react";

export default function InvoiceForm({
  orders,
  initialData,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState({
    order: "",
    paymentStatus: "Pending",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        order: initialData.order?._id || "",
        paymentStatus:
          initialData.paymentStatus || "Pending",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const selectedOrder = orders.find(
    (o) => o._id === form.order
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Order */}

      <div>
        <label className="block mb-2 font-medium">
          Select Order
        </label>

        <select
          name="order"
          value={form.order}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="">
            Select Order
          </option>

          {orders.map((order) => (
            <option
              key={order._id}
              value={order._id}
            >
              {order.retailer?.shopName} - ₹
              {order.totalAmount}
            </option>
          ))}
        </select>
      </div>

      {/* Order Preview */}

      {selectedOrder && (
        <div className="bg-gray-50 rounded-lg p-4 border">

          <h3 className="font-bold text-lg mb-3">
            Order Details
          </h3>

          <p>
            <strong>Retailer:</strong>{" "}
            {selectedOrder.retailer?.shopName}
          </p>

          <p>
            <strong>Total:</strong> ₹
            {selectedOrder.totalAmount}
          </p>

          <p>
            <strong>Payment:</strong>{" "}
            {selectedOrder.paymentMethod}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {selectedOrder.orderStatus}
          </p>

        </div>
      )}

      {/* Payment Status */}

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
          <option>Partial</option>
          <option>Paid</option>
        </select>
      </div>

      {/* Notes */}

      <div>
        <label className="block mb-2 font-medium">
          Notes
        </label>

        <textarea
          name="notes"
          rows={4}
          value={form.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* Submit */}

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          {loading
            ? "Saving..."
            : initialData
            ? "Update Invoice"
            : "Create Invoice"}
        </button>

      </div>

    </form>
  );
}