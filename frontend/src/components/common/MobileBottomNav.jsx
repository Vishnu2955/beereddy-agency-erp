import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaBoxOpen, FaShoppingCart, FaCreditCard, FaUser } from "react-icons/fa";

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/dashboard", icon: <FaHome className="text-lg" /> },
    { name: "Products", path: "/products", icon: <FaBoxOpen className="text-lg" /> },
    { name: "Orders", path: "/orders", icon: <FaShoppingCart className="text-lg" /> },
    { name: "Payments", path: "/payments", icon: <FaCreditCard className="text-lg" /> },
    { name: "Profile", path: "/settings", icon: <FaUser className="text-lg" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl md:hidden px-2 py-1.5 shadow-2xl print:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 min-h-[48px] min-w-[56px] rounded-2xl transition-all duration-150 touch-manipulation active:scale-95 cursor-pointer ${
                isActive
                  ? "text-blue-400 font-black"
                  : "text-slate-400 hover:text-slate-200 font-semibold"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 bg-blue-600/20 rounded-2xl border border-blue-500/30 pointer-events-none" />
              )}
              <div className={`transition-transform duration-150 ${isActive ? "-translate-y-0.5 scale-110" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 z-10">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
