import { NavLink } from "react-router-dom";
import { FaHome, FaBoxOpen, FaClipboardList, FaFileInvoice, FaCog } from "react-icons/fa";
import { getUser } from "../../utils/auth";

export default function MobileBottomNav() {
  const user = getUser();
  const isRetailer = user?.role === "retailer";

  const navItems = [
    { name: "Home", path: "/dashboard", icon: <FaHome size={18} /> },
    { name: "Catalog", path: "/products", icon: <FaBoxOpen size={18} /> },
    { name: "Orders", path: "/orders", icon: <FaClipboardList size={18} /> },
    { name: "Invoices", path: "/invoices", icon: <FaFileInvoice size={18} /> },
    { name: "Settings", path: "/settings", icon: <FaCog size={18} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg lg:hidden px-2 py-1 shadow-2xl print:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 min-h-[44px] min-w-[44px] rounded-xl transition-all duration-200 ${
                isActive
                  ? isRetailer
                    ? "text-emerald-400 font-extrabold scale-105"
                    : "text-indigo-400 font-extrabold scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold mt-1 tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
