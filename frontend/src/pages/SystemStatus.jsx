import { useEffect, useState } from "react";
import {
  FaServer,
  FaDatabase,
  FaHdd,
  FaMemory,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaShieldAlt,
  FaNetworkWired,
  FaCodeBranch,
} from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

export default function SystemStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/system/status");
      if (res.data.success) {
        setData(res.data.system);
      }
    } catch (err) {
      console.error("Load System Status Error:", err);
      errorToast("Failed to load infrastructure system metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleToggleMaintenance = async () => {
    if (!data) return;
    const currentState = data.maintenance.isMaintenanceMode;
    try {
      setTogglingMaintenance(true);
      const res = await api.put("/system/maintenance", {
        isMaintenanceMode: !currentState,
      });
      if (res.data.success) {
        successToast(res.data.message);
        await loadStatus();
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to update maintenance mode.");
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const formatUptime = (sec) => {
    if (!sec) return "0m";
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Fetching System Infrastructure Metrics...</p>
      </div>
    );
  }

  const sys = data || {};
  const checklist = sys.deploymentChecklist || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shadow-inner">
            <FaServer />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">System Infrastructure & Status</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                {sys.serverStatus || "RUNNING"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Production deployment verification, memory allocation, storage capacity, and maintenance controls.
            </p>
          </div>
        </div>

        <button
          onClick={loadStatus}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
        >
          <FaSync /> Refresh Status
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Server & Uptime */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Server Uptime</span>
            <FaServer className="text-indigo-400 text-lg" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatUptime(sys.uptimeSeconds)}</div>
          <p className="text-[11px] text-slate-400">Environment: <span className="font-bold text-indigo-300 uppercase">{sys.environment}</span></p>
        </div>

        {/* Memory RSS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Process Memory (RSS)</span>
            <FaMemory className="text-emerald-400 text-lg" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{sys.memory?.rssMB || 0} MB</div>
          <p className="text-[11px] text-slate-400">Heap Used: <span className="font-mono text-white font-bold">{sys.memory?.heapUsedMB} MB</span></p>
        </div>

        {/* Storage Uploads Size */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Storage Capacity</span>
            <FaHdd className="text-amber-400 text-lg" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{sys.storage?.uploadsSizeMB || 0} MB</div>
          <p className="text-[11px] text-slate-400">Uploads Directory Usage</p>
        </div>

        {/* Database Connection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Database Status</span>
            <FaDatabase className="text-blue-400 text-lg" />
          </div>
          <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
            <FaCheckCircle /> {sys.database?.status}
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">{sys.database?.host}</p>
        </div>
      </div>

      {/* Maintenance Mode Control & Deployment Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Mode Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FaTools className="text-amber-400" /> Maintenance Mode Governance
            </h3>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                sys.maintenance?.isMaintenanceMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {sys.maintenance?.isMaintenanceMode ? "MAINTENANCE ACTIVE" : "NORMAL OPERATION"}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            When Maintenance Mode is <strong>ENABLED</strong>, non-admin API & user requests are paused with a scheduled maintenance overlay. Admin accounts maintain full bypass access.
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Enable Maintenance Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!sys.maintenance?.isMaintenanceMode}
                onChange={handleToggleMaintenance}
                disabled={togglingMaintenance}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>
        </div>

        {/* Automated Deployment Verification Checklist */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FaShieldAlt className="text-indigo-400" /> Automated Production Deployment Checklist
            </h3>
            <span className="text-xs text-slate-400 font-mono">Build Version {sys.version}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Environment Variables</span>
              {checklist.environmentVariables ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><FaCheckCircle /> Verified</span>
              ) : (
                <span className="text-red-400 font-bold text-xs flex items-center gap-1"><FaExclamationTriangle /> Missing</span>
              )}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Database Connection Pool</span>
              {checklist.databaseConnection ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><FaCheckCircle /> Connected</span>
              ) : (
                <span className="text-red-400 font-bold text-xs flex items-center gap-1"><FaExclamationTriangle /> Disconnected</span>
              )}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Storage & Uploads Access</span>
              {checklist.storageAccess ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><FaCheckCircle /> Writable</span>
              ) : (
                <span className="text-red-400 font-bold text-xs flex items-center gap-1"><FaExclamationTriangle /> Error</span>
              )}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">API Health Monitoring</span>
              {checklist.apiHealth ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><FaCheckCircle /> Healthy</span>
              ) : (
                <span className="text-red-400 font-bold text-xs flex items-center gap-1"><FaExclamationTriangle /> Error</span>
              )}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">PWA Service Worker</span>
              {checklist.serviceWorker ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><FaCheckCircle /> Active</span>
              ) : (
                <span className="text-red-400 font-bold text-xs flex items-center gap-1"><FaExclamationTriangle /> Inactive</span>
              )}
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Web App Manifest Spec</span>
              {checklist.manifest ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1"><FaCheckCircle /> Valid</span>
              ) : (
                <span className="text-red-400 font-bold text-xs flex items-center gap-1"><FaExclamationTriangle /> Error</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
