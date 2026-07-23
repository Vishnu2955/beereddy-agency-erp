import { useEffect } from "react";
import RetailerForm from "./RetailerForm";

export default function RetailerModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
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

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Retailer" : "Add Retailer"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            ✕
          </button>

        </div>

        <div className="p-6">

          <RetailerForm
            initialData={initialData}
            onSubmit={onSubmit}
            loading={loading}
          />

        </div>

      </div>
    </div>
  );
}