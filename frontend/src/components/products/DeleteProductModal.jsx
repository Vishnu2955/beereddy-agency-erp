export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  product,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold text-red-600">
          Delete Product
        </h2>

        <p className="mt-4 text-gray-600">
          Are you sure you want to delete
          <span className="font-semibold">
            {" "}
            {product?.productName}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
}