import { useState, useEffect } from "react";
import {
  FaMobileAlt,
  FaWifi,
  FaDatabase,
  FaMoon,
  FaBell,
  FaShieldAlt,
  FaCheckCircle,
  FaSync,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import { successToast } from "../utils/toast";

export default function MobileSettings() {
  const navigate = useNavigate();
  const user = getUser();
  const [offlineMode, setOfflineMode] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (user?.role === "retailer") {
      navigate("/settings", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSave = () => {
    successToast("Mobile & PWA preferences saved!");
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Network Connectivity Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between shadow-md transition ${
          isOnline
            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
            : "bg-amber-950/40 text-amber-300 border-amber-800/60 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-3">
          <FaWifi className="text-xl shrink-0" />
          <div>
            <h3 className="text-sm font-bold">
              {isOnline ? "Network Status: Online" : "Network Status: Offline"}
            </h3>
            <p className="text-xs opacity-80">
              {isOnline
                ? "Connected to Beereddy ERP server."
                : "Working in offline mode. Cached data remains accessible."}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
          }`}
        >
          {isOnline ? "Connected" : "Offline Mode"}
        </span>
      </div>

      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl">
          <FaMobileAlt />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">Mobile App & PWA Settings</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Configure offline storage, network synchronization, data usage, and notification alerts.
          </p>
        </div>
      </div>

      {/* Settings Options */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-5 shadow-2xl">
        {/* Offline Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <FaDatabase className="text-indigo-400" /> Offline Caching Mode
            </span>
            <span className="text-xs text-slate-400 block">
              Store essential assets and product data locally for offline availability.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => setOfflineMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {/* Auto Sync Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <FaSync className="text-emerald-400" /> Automatic Background Sync
            </span>
            <span className="text-xs text-slate-400 block">
              Automatically sync pending orders and inventory changes when reconnecting.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {/* Data Saver Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <FaWifi className="text-amber-400" /> Data Saver Mode
            </span>
            <span className="text-xs text-slate-400 block">
              Reduce mobile network usage by loading compressed images and optimized payloads.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={dataSaver}
              onChange={(e) => setDataSaver(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {/* System Info Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FaShieldAlt className="text-indigo-400" /> App & PWA Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Application:</span>
              <span className="font-bold text-white">Beereddy Agency ERP</span>
            </div>
            <div>
              <span className="text-slate-400 block">PWA Version:</span>
              <span className="font-mono font-bold text-emerald-400">v2.0.0</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            Save Mobile Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
