import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import { getUser } from "../../utils/auth";
import { hapticTap } from "../../utils/haptic";

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  if (!user) return null;

  const isRetailer = user.role === "retailer";
  const currentPath = location.pathname;

  // Don't render on auth pages or printed invoices
  if (currentPath === "/" || currentPath.startsWith("/invoice/")) {
    return null;
  }

  const handleClick = () => {
    hapticTap();
    if (isRetailer) {
      navigate("/products");
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden print:hidden">
      <button
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-2xl shadow-blue-600/50 border-2 border-white/20 active:scale-90 transition-transform cursor-pointer"
        aria-label={isRetailer ? "New Order" : "Add Product"}
        title={isRetailer ? "New Order" : "Add Product"}
      >
        {isRetailer ? <FaShoppingCart /> : <FaPlus />}
      </button>
    </div>
  );
}
