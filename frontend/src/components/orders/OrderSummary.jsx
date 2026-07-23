export default function OrderSummary({ items }) {

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  const gstAmount = items.reduce((sum, item) => {
    const itemTotal =
      Number(item.quantity || 0) * Number(item.price || 0);

    return sum + (itemTotal * Number(item.gst || 0)) / 100;
  }, 0);

  const grandTotal = subtotal + gstAmount;

  return (
    <div className="bg-gray-50 rounded-xl p-6 border">

      <h3 className="text-xl font-bold mb-4">
        Order Summary
      </h3>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between">
          <span>GST</span>
          <span className="font-semibold">
            ₹{gstAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-xl font-bold text-green-600">
          <span>Grand Total</span>
          <span>
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>

      </div>

    </div>
  );
}