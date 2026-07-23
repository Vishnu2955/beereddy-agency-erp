export default function DeleteInvoiceModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  invoice,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

        {/* Header */}

        <div className="border-b px-6 py-4">

          <h2 className="text-2xl font-bold text-red-600">
            Delete Invoice
          </h2>

        </div>

        {/* Body */}

        <div className="p-6">

          <p className="text-gray-700">
            Are you sure you want to delete this invoice?
          </p>

          <div className="mt-5 bg-gray-100 rounded-lg p-4">

            <p>
              <strong>Invoice:</strong>{" "}
              {invoice?.invoiceNumber}
            </p>

            <p>
              <strong>Retailer:</strong>{" "}
              {invoice?.retailer?.shopName}
            </p>

            <p>
              <strong>Total:</strong>{" "}
              ₹{Number(
                invoice?.totalAmount || 0
              ).toLocaleString("en-IN")}
            </p>

          </div>

        </div>

        {/* Footer */}

        <div className="border-t px-6 py-4 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}