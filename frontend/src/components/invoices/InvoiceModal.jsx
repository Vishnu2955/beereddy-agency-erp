import { useEffect } from "react";
import InvoiceForm from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";

export default function InvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  orders,
  invoice,
  loading,
}) {

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >

      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">

        {/* Header */}

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Invoice" : "Create Invoice"}
          </h2>

          <div className="flex gap-3">

            {invoice && (
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                🖨 Print
              </button>
            )}

            <button
              onClick={onClose}
              className="text-2xl hover:text-red-600"
            >
              ✕
            </button>

          </div>

        </div>

        {/* Form */}

        <div className="p-6">

          <InvoiceForm
            initialData={initialData}
            orders={orders}
            onSubmit={onSubmit}
            loading={loading}
          />

        </div>

        {/* Preview */}

        {invoice && (
          <div className="border-t p-6 bg-gray-50">
            <InvoicePreview invoice={invoice} />
          </div>
        )}

      </div>

    </div>
  );
}