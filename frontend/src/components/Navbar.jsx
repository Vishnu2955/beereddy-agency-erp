import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaSearch, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaSignOutAlt } from "react-icons/fa";
import { getUser, logout } from "../utils/auth";
import { successToast } from "../utils/toast";
import api from "../services/api";

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const user = getUser();
  const role = user?.role || "admin";
  const isRetailer = role === "retailer";

  const [showNotifications, setShowNotifications] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const notifRef = useRef(null);

  const displayName = user?.fullName || user?.shopName || (role === "admin" ? "Administrator" : "Retailer Partner");
  const roleSubtitle = role === "admin" ? "Super Admin (V Bond Agency)" : (user?.shopName ? `Retailer • ${user.shopName}` : "Retailer Account");

  const handleLogout = () => {
    logout();
    successToast("Logged out successfully.");
    navigate("/login");
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real notifications from Database API
  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data && res.data.notifications) {
        setLiveNotifications(res.data.notifications);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 6000); // Polling every 6 sec
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (n) => {
    setShowNotifications(false);
    if (n._id) {
      try {
        await api.put(`/notifications/read/${n._id}`);
      } catch (_) {}
    }

    const titleLower = (n.title || "").toLowerCase();
    const msgLower = (n.message || n.desc || "").toLowerCase();

    if (titleLower.includes("order") || msgLower.includes("order")) {
      navigate("/orders");
    } else if (titleLower.includes("product") || msgLower.includes("product") || titleLower.includes("stock") || msgLower.includes("stock")) {
      navigate(isRetailer ? "/products" : "/inventory");
    } else if (titleLower.includes("invoice") || msgLower.includes("invoice")) {
      navigate("/invoices");
    } else if (titleLower.includes("payment") || msgLower.includes("payment")) {
      navigate(isRetailer ? "/payments" : "/payments");
    } else {
      navigate(isRetailer ? "/orders" : "/orders");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      return new Date(dateStr).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return "Just now";
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-20 flex items-center justify-between px-6 sticky top-0 z-20 shadow-xs print:hidden">

      {/* Left Section: Mobile Menu & Brand Title */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars className="text-xl" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Beereddy Agency
            </h2>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs uppercase tracking-wider ${
              isRetailer
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}>
              {isRetailer ? "Retailer Portal" : "Admin Panel"}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {isRetailer ? "Official B2B Ordering & Payment Center" : "Executive Distributor Command Center"}
          </p>
        </div>
      </div>

      {/* Right Section: Actions & User Info */}
      <div className="flex items-center gap-4">

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Quick search products, orders..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition"
          />
        </div>

        {/* Notifications Icon Button & Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              loadNotifications();
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
            title="Notifications"
          >
            <FaBell className="text-lg" />
            {liveNotifications.some((n) => !n.isRead) && (
              <>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full" />
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</h4>
                <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                  {liveNotifications.length} Alerts
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {liveNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium">
                    No new order alerts or notifications.
                  </div>
                ) : (
                  liveNotifications.map((n) => (
                    <div
                      key={n._id || n.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNotificationClick(n);
                      }}
                      className="p-3.5 hover:bg-slate-100 transition flex items-start gap-3 cursor-pointer group"
                    >
                      {n.priority === "High" || n.priority === "Urgent" ? (
                        <FaExclamationTriangle className="text-amber-500 text-base mt-0.5 flex-shrink-0" />
                      ) : n.status === "Sent" || n.channel === "In-App" ? (
                        <FaInfoCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
                      ) : (
                        <FaCheckCircle className="text-emerald-500 text-base mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug break-words">{n.message || n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card Header Pill & Sign Out */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md ${
                isRetailer ? "bg-gradient-to-tr from-emerald-600 to-teal-500" : "bg-gradient-to-tr from-indigo-600 to-blue-600"
              }`}>
                {displayName.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="hidden sm:block">
              <p className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-1">
                {displayName}
              </p>
              <p className="text-[11px] font-semibold text-slate-400">
                {roleSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Sign Out"
          >
            <FaSignOutAlt className="text-sm" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
}