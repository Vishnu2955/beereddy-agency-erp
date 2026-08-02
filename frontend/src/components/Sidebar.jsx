import {
  FaBoxOpen,
  FaChartBar,
  FaClipboardList,
  FaFileInvoice,
  FaHome,
  FaMoneyCheckAlt,
  FaSignOutAlt,
  FaStore,
  FaTimes,
  FaWarehouse,
  FaShieldAlt,
  FaWallet,
  FaUser,
  FaWhatsapp,
  FaLock,
  FaServer,
  FaInfoCircle,
  FaStethoscope,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    ],
  },
  {
    title: "MANAGEMENT & CATALOG",
    items: [
      { name: "Products Catalog", path: "/products", icon: <FaBoxOpen /> },
      { name: "Inventory Stock", path: "/inventory", icon: <FaWarehouse />, adminOnly: true },
      { name: "Retailers Network", path: "/retailers", icon: <FaStore />, adminOnly: true },
    ],
  },
  {
    title: "OPERATIONS & ORDERS",
    items: [
      { name: "Orders & Fulfillment", path: "/orders", icon: <FaClipboardList /> },
      { name: "Analytics & Reports", path: "/reports", icon: <FaChartBar />, adminOnly: true },
      { name: "Enterprise Analytics", path: "/analytics", icon: <FaChartBar />, adminOnly: true },
    ],
  },
  {
    title: "FINANCIALS & SECURITY",
    items: [
      { name: "Invoices & Billing", path: "/invoices", icon: <FaFileInvoice /> },
      { name: "Payments & Receipts", path: "/payments", icon: <FaMoneyCheckAlt /> },
      { name: "Outstanding Dues", path: "/outstanding", icon: <FaWallet />, adminOnly: true },
      { name: "Audit Logs", path: "/audit-logs", icon: <FaShieldAlt />, adminOnly: true },
      { name: "Security Center", path: "/security-dashboard", icon: <FaShieldAlt />, adminOnly: true },
      { name: "Security Policy", path: "/security-settings", icon: <FaLock />, adminOnly: true },
      { name: "System Status", path: "/system-status", icon: <FaServer />, adminOnly: true },
      { name: "System Diagnostics", path: "/system-diagnostics", icon: <FaStethoscope />, adminOnly: true },
      { name: "About ERP", path: "/about", icon: <FaInfoCircle /> },
      { name: "WhatsApp Settings", path: "/settings", icon: <FaWhatsapp />, adminOnly: true },
    ],
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role || "admin";
  const isRetailer = role === "retailer";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user?.shopName || user?.fullName || (isRetailer ? "Valued Retailer" : "Agency Admin");
  const userInitials = displayName.substring(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden transition-opacity print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800/80 text-slate-100 shadow-2xl z-40 transition-all duration-300 flex flex-col print:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg font-bold ${
              isRetailer 
                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20" 
                : "bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-indigo-500/20"
            }`}>
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                BEEREDDY
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isRetailer ? "bg-emerald-400" : "bg-indigo-400"}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRetailer ? "Retailer Portal" : "V Bond Distributor"}
                </span>
              </div>
            </div>
          </div>

          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Navigation Section Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-none">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !isRetailer || !item.adminOnly);
            if (!visibleItems.length) return null;

            return (
              <div key={group.title} className="space-y-1.5">
                <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  {group.title}
                </p>

                {visibleItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                        isActive
                          ? isRetailer
                            ? "bg-emerald-600/15 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm"
                            : "bg-indigo-600/15 text-indigo-300 font-bold border border-indigo-500/30 shadow-sm"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      }`
                    }
                  >
                    <span className={`text-base transition-transform duration-200 group-hover:scale-110`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        {/* User Profile Footer Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border ${
              isRetailer ? "bg-emerald-950 text-emerald-300 border-emerald-800/50" : "bg-indigo-950 text-indigo-300 border-indigo-800/50"
            }`}>
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {isRetailer ? "Authorized Partner" : "System Administrator"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-red-600/20 hover:text-red-400 text-slate-300 hover:border-red-500/30 border border-slate-700/60 py-2.5 rounded-xl transition text-xs font-semibold"
          >
            <FaSignOutAlt className="text-sm" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}