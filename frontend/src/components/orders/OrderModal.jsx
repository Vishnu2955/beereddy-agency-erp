import { useEffect } from "react";
import OrderForm from "./OrderForm";

export default function OrderModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  retailers,
  products,
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

      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-2xl font-bold">

            {initialData
              ? "Edit Order"
              : "Create New Order"}

          </h2>

          <button
            onClick={onClose}
            className="text-2xl hover:text-red-600"
          >
            ✕

          </button>

        </div>

        <div className="p-6">

          <OrderForm
            initialData={initialData}
            retailers={retailers}
            products={products}
            onSubmit={onSubmit}
            loading={loading}
          />

        </div>

      </div>

    </div>

  );

}