import { useEffect, useState } from "react";
import {
  FaStethoscope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSync,
  FaBug,
  FaTachometerAlt,
  FaClock,
  FaCheckDouble,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

export default function SystemDiagnostics() {
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [performance, setPerformance] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checkRes, bugsRes] = await Promise.all([
        api.get("/diagnostics/run-check"),
        api.get("/diagnostics/bugs"),
      ]);

      if (checkRes.data.success) {
        setCheckResult(checkRes.data);
        setPerformance(checkRes.data.performance);
      }
      if (bugsRes.data.success) {
        setBugs(bugsRes.data.bugs || []);
      }
    } catch (err) {
      console.error("Load Diagnostics Error:", err);
      errorToast("Failed to load system diagnostics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunSelfCheck = async () => {
    try {
      setRunningCheck(true);
      const res = await api.get("/diagnostics/run-check");
      if (res.data.success) {
        setCheckResult(res.data);
        setPerformance(res.data.performance);
        successToast("⚡ 8-Step System Self-Check Completed!");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to execute system check.");
    } finally {
      setRunningCheck(false);
    }
  };

  const handleResolveBug = async (bugId) => {
    try {
      const res = await api.put(`/diagnostics/bugs/${bugId}/resolve`);
      if (res.data.success) {
        successToast("Bug report marked as resolved!");
        await loadData();
      }
    } catch (err) {
      errorToast("Failed to resolve bug report.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Running Production System Self-Check...</p>
      </div>
    );
  }

  const summary = checkResult?.summary || {};
  const checks = checkResult?.checks || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl shadow-inner">
            <FaStethoscope />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">System Diagnostics & Self-Check</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                {summary.overallHealth || "EXCELLENT"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              One-click automated 8-step verification of Database, Storage, Auth, WhatsApp, Backups, and APIs.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunSelfCheck}
          disabled={runningCheck}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 self-start md:self-auto"
        >
          <FaSync className={runningCheck ? "animate-spin" : ""} />
          {runningCheck ? "Running Self-Check..." : "Run System Self-Check Now"}
        </button>
      </div>

      {/* Summary Score Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Tests</span>
            <p className="text-2xl font-black text-white">{summary.total || 8}</p>
          </div>
          <FaStethoscope className="text-indigo-400 text-xl" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Passed Tests</span>
            <p className="text-2xl font-black text-emerald-400">{summary.passed || 0}</p>
          </div>
          <FaCheckCircle className="text-emerald-400 text-xl" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Warnings</span>
            <p className="text-2xl font-black text-amber-400">{summary.warning || 0}</p>
          </div>
          <FaExclamationTriangle className="text-amber-400 text-xl" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Avg API Latency</span>
            <p className="text-2xl font-black text-indigo-300 font-mono">{performance?.avgResponseTimeMs || 0} ms</p>
          </div>
          <FaTachometerAlt className="text-indigo-400 text-xl" />
        </div>
      </div>

      {/* 8-Step Verification Tests Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
        <h3 className="text-base font-bold flex items-center gap-2 border-b border-slate-800 pb-3">
          <FaShieldAlt className="text-indigo-400" /> Automated 8-Step System Self-Check Results
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{chk.name}</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{chk.details}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
                  chk.status === "PASSED"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : chk.status === "WARNING"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {chk.status === "PASSED" ? (
                  <><FaCheckCircle /> PASSED</>
                ) : chk.status === "WARNING" ? (
                  <><FaExclamationTriangle /> WARNING</>
                ) : (
                  <><FaTimesCircle /> FAILED</>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Bug Tracker & Captured Exceptions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <FaBug className="text-amber-400" /> Captured Exceptions & Internal Bug Tracker
          </h3>
          <span className="text-xs text-slate-400 font-mono">{bugs.length} Logs Captured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Time</th>
                <th className="p-3">Module</th>
                <th className="p-3">Error Name</th>
                <th className="p-3">Message</th>
                <th className="p-3">Severity</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {bugs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 font-semibold">
                    🎉 No system exceptions or bugs logged. System is operating at 100% stability.
                  </td>
                </tr>
              ) : (
                bugs.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      <div className="font-bold text-white">{b.bugId}</div>
                      <div className="text-[10px]">{new Date(b.createdAt).toLocaleString("en-IN")}</div>
                    </td>
                    <td className="p-3 font-bold text-indigo-300">{b.module}</td>
                    <td className="p-3 text-amber-300 font-mono">{b.errorName}</td>
                    <td className="p-3 text-slate-300 truncate max-w-xs">{b.errorMessage}</td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          b.severity === "Critical"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : b.severity === "High"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          b.status === "Resolved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {b.status !== "Resolved" && (
                        <button
                          onClick={() => handleResolveBug(b._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <FaCheckDouble /> Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
