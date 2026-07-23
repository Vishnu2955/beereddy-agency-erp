export default function DeleteOrderModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  order,
}) {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold text-red-600 mb-4">

          Delete Order

        </h2>

        <p>

          Are you sure you want to delete this order?

        </p>

        <div className="mt-4 p-3 bg-gray-100 rounded">

          <p className="font-semibold">

            {order?.retailer?.shopName}

          </p>

          <p>

            ₹{order?.totalAmount}

          </p>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

    </div>

  );

}