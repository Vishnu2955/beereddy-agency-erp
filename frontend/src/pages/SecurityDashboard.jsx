import { useEffect, useState } from "react";
import {
  FaShieldAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaLock,
  FaDatabase,
  FaServer,
  FaDownload,
  FaHistory,
  FaSync,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

export default function SecurityDashboard() {
  const [stats, setStats] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, backupsRes] = await Promise.all([
        api.get("/security/stats"),
        api.get("/backup/list"),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (backupsRes.data.success) {
        setBackups(backupsRes.data.backups || []);
      }
    } catch (err) {
      console.error("Load Security Dashboard Error:", err);
      errorToast(err.response?.data?.message || "Failed to load security dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const res = await api.post("/backup/create");
      if (res.data.success) {
        successToast("Database backup created successfully!");
        await loadData();
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to create backup.");
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackupToRestore) return;
    try {
      setRestoringBackup(true);
      const res = await api.post("/backup/restore", {
        filename: selectedBackupToRestore.filename,
        confirmKey: "RESTORE_CONFIRM",
      });
      if (res.data.success) {
        successToast("Database restored successfully!");
        setSelectedBackupToRestore(null);
        await loadData();
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to restore backup.");
    } finally {
      setRestoringBackup(false);
    }
  };

  const formatUptime = (sec) => {
    if (!sec) return "0m";
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (_) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading Security Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl shadow-inner">
            <FaShieldAlt />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Security Command Center</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                Single Admin Protected
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Real-time threat monitoring, failed login tracking, system health, and database backups.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <FaSync /> Refresh Metrics
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creatingBackup}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            <FaDownload /> {creatingBackup ? "Creating Backup..." : "Create Backup Now"}
          </button>
        </div>
      </div>

      {/* Security Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Logins */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Logins Today</span>
            <FaUserCheck className="text-emerald-400 text-lg" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.loginsToday || 0}</div>
          <p className="text-[11px] text-slate-400">Successful authenticated user sessions</p>
        </div>

        {/* Failed Logins */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Failed Logins Today</span>
            <FaExclamationTriangle className="text-amber-400 text-lg" />
          </div>
          <div className="text-3xl font-black text-amber-400">{stats?.failedLoginsToday || 0}</div>
          <p className="text-[11px] text-slate-400">Invalid password login attempts</p>
        </div>

        {/* Blocked Accounts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Locked Accounts</span>
            <FaLock className="text-red-400 text-lg" />
          </div>
          <div className="text-3xl font-black text-red-400">{stats?.blockedAccounts || 0}</div>
          <p className="text-[11px] text-slate-400">Locked due to 5+ failed attempts</p>
        </div>

        {/* System Uptime & DB Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">DB Status & Uptime</span>
            <FaDatabase className="text-indigo-400 text-lg" />
          </div>
          <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
            <FaCheckCircle className="text-base" /> {stats?.databaseStatus || "Connected"}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <FaServer /> Server Uptime: <span className="text-white font-mono font-bold">{formatUptime(stats?.uptimeSeconds)}</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Backup Files & Recent Security Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backups List Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FaDatabase className="text-indigo-400" /> Database Backup Snapshots
            </h3>
            <span className="text-xs text-slate-400 font-mono">{backups.length} Files</span>
          </div>

          {backups.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No backup snapshots generated yet. Click "Create Backup Now" to create your first backup.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {backups.map((b) => (
                <div
                  key={b.filename}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-white truncate">{b.filename}</p>
                    <p className="text-[10px] text-slate-400">
                      {formatDate(b.createdAt)} • {(b.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBackupToRestore(b)}
                    className="bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Audit Activity Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FaHistory className="text-emerald-400" /> Recent Security & Audit Activity Stream
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Audit Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">User / Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">IP / Device</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {stats?.recentActivity?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      No security events recorded recently.
                    </td>
                  </tr>
                ) : (
                  stats?.recentActivity?.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white truncate max-w-[120px]">{log.userEmail || "System"}</div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {log.userRole || "User"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-indigo-300">{log.action}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[10px]">
                        {log.ipAddress}
                      </td>
                      <td className="p-3 text-slate-300 truncate max-w-[180px]">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restore Backup Modal */}
      {selectedBackupToRestore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-amber-400">
              <FaExclamationTriangle className="text-2xl" />
              <h3 className="text-lg font-bold">Confirm Database Restore</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to restore the system database from <span className="font-mono text-amber-400 font-bold">{selectedBackupToRestore.filename}</span>? Existing records will be updated to match this backup state.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBackupToRestore(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={restoringBackup}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {restoringBackup ? "Restoring..." : "Yes, Restore Database"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
