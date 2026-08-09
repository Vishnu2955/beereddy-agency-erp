import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaTimes, FaShoppingBag, FaTruck, FaMoneyBillWave, FaBoxOpen, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function NotificationPopupManager() {
  const navigate = useNavigate();
  const [activePopup, setActivePopup] = useState(null);
  const seenIdsRef = useRef(new Set());

  // Function to map notification type to icon, badge, and target link
  const getNotifDetails = (type, title = "") => {
    const lowerType = (type || "").toLowerCase();
    const lowerTitle = (title || "").toLowerCase();

    if (lowerType.includes("order") || lowerTitle.includes("order")) {
      return {
        icon: <FaShoppingBag className="text-amber-500 text-lg" />,
        badge: "ORDER",
        link: "/orders",
      };
    }
    if (lowerType.includes("payment") || lowerTitle.includes("payment")) {
      return {
        icon: <FaMoneyBillWave className="text-blue-500 text-lg" />,
        badge: "PAYMENT",
        link: "/payments",
      };
    }
    if (lowerType.includes("stock") || lowerTitle.includes("stock") || lowerTitle.includes("inventory")) {
      return {
        icon: <FaBoxOpen className="text-emerald-500 text-lg" />,
        badge: "INVENTORY",
        link: "/inventory",
      };
    }
    if (lowerType.includes("invoice") || lowerTitle.includes("invoice")) {
      return {
        icon: <FaCheckCircle className="text-emerald-500 text-lg" />,
        badge: "INVOICE",
        link: "/invoices",
      };
    }
    return {
      icon: <FaBell className="text-amber-500 text-lg" />,
      badge: "NOTIFICATION",
      link: "/dashboard",
    };
  };

  const fetchRealNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success && Array.isArray(res.data.notifications)) {
        const notifs = res.data.notifications;
        
        // Find the most recent unread real notification that hasn't been shown in this session
        const newNotif = notifs.find(n => !n.isRead && !seenIdsRef.current.has(n._id || n.id));

        if (newNotif) {
          const notifId = newNotif._id || newNotif.id;
          seenIdsRef.current.add(notifId);

          const meta = getNotifDetails(newNotif.type, newNotif.title);

          setActivePopup({
            id: notifId,
            title: newNotif.title || "Real System Notification",
            message: newNotif.message || "New event recorded in system.",
            badge: meta.badge,
            icon: meta.icon,
            link: meta.link,
            createdAt: newNotif.createdAt ? new Date(newNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          });
        }
      }
    } catch (err) {
      // Quiet fail if network/unauthorized
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchRealNotifications();

    // Poll for real backend notifications every 10 seconds
    const interval = setInterval(() => {
      fetchRealNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide active popup toast after 6 seconds
  useEffect(() => {
    if (activePopup) {
      const hideTimer = setTimeout(() => {
        setActivePopup(null);
      }, 6000);
      return () => clearTimeout(hideTimer);
    }
  }, [activePopup]);

  if (!activePopup) return null;

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[9999] max-w-sm w-[92vw] sm:w-auto popup-notification-slide">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-amber-500/50 text-white p-4 rounded-3xl shadow-2xl shadow-slate-950/90 flex items-start justify-between gap-3">
        
        <div 
          className="flex items-start gap-3 flex-1 cursor-pointer" 
          onClick={() => { 
            navigate(activePopup.link); 
            setActivePopup(null); 
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            {activePopup.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 tracking-wider">
                {activePopup.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{activePopup.createdAt}</span>
            </div>
            <h4 className="text-xs font-black text-white tracking-tight leading-snug">
              {activePopup.title}
            </h4>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {activePopup.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePopup(null)}
          className="text-slate-400 hover:text-white p-1 text-xs transition cursor-pointer shrink-0"
          title="Dismiss"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
