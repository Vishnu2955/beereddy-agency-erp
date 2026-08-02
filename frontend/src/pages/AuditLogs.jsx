import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { errorToast } from "../utils/toast";
import {
  FaShieldAlt,
  FaSync,
  FaSearch,
  FaFilter,
  FaHistory,
  FaUserShield,
  FaDesktop,
  FaExclamationCircle,
} from "react-icons/fa";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Load Audit Logs Error:", err);
      errorToast("Failed to load immutable system audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const uEmail = log.userEmail || "";
      const act = log.action || "";
      const mod = log.affectedModule || "";
      const rsn = log.reason || "";
      const matchesSearch =
        uEmail.toLowerCase().includes(search.toLowerCase()) ||
        act.toLowerCase().includes(search.toLowerCase()) ||
        mod.toLowerCase().includes(search.toLowerCase()) ||
        rsn.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (moduleFilter !== "ALL" && log.affectedModule !== moduleFilter) return false;
      if (actionFilter !== "ALL" && log.action !== actionFilter) return false;

      return true;
    });
  }, [logs, search, moduleFilter, actionFilter]);

  const exportCSV = () => {
    if (!filteredLogs.length) return;
    const headers = ["Timestamp", "User Email", "Role", "Action", "Module", "IP Address", "Reason"];
    const rows = filteredLogs.map((log) => [
      `"${new Date(log.createdAt).toLocaleString("en-IN")}"`,
      `"${log.userEmail || ""}"`,
      `"${log.userRole || ""}"`,
      `"${log.action || ""}"`,
      `"${log.affectedModule || ""}"`,
      `"${log.ipAddress || ""}"`,
      `"${(log.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold">Loading Security Audit Trail...</div>;
  }

  return (
    <div className="container-fluid p-4 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Security & System Audit Logs</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <FaShieldAlt /> IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete compliance tracking of logins, role edits, order creations, stock adjustments & finance updates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl transition text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2.5 rounded-xl transition text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            Print PDF Report
          </button>
          <button
            onClick={loadAuditLogs}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3.5 py-2.5 rounded-xl transition text-xs flex items-center gap-1.5 shadow cursor-pointer uppercase"
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
            <FaFilter /> Module:
          </div>
          <select
            className="border rounded-xl px-3 py-2 text-xs outline-none font-bold bg-slate-50"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="ALL">All Modules</option>
            <option value="Auth">Auth & Login</option>
            <option value="Orders">Orders</option>
            <option value="Inventory">Inventory</option>
            <option value="Payments">Payments</option>
            <option value="Invoices">Invoices</option>
            <option value="Retailers">Retailers</option>
            <option value="Delivery">Delivery</option>
            <option value="CRM">CRM</option>
          </select>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
            Action:
          </div>
          <select
            className="border rounded-xl px-3 py-2 text-xs outline-none font-bold bg-slate-50"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="Login">Login</option>
            <option value="Order Creation">Order Creation</option>
            <option value="Inventory Change">Inventory Change</option>
            <option value="Payment Update">Payment Update</option>
            <option value="Role Change">Role Change</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
          <input
            type="text"
            className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search email, action, module, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User Email / Role</th>
                <th className="p-4">Action Performed</th>
                <th className="p-4 text-center">Module</th>
                <th className="p-4">IP Address & Agent</th>
                <th className="p-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-bold">
                    No security audit logs matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-blue-50/30 transition">
                    <td className="p-4 font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{log.userEmail || "System"}</div>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {log.userRole || "User"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <FaHistory className="text-blue-500" /> {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-purple-200">
                        {log.affectedModule}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      <div>IP: {log.ipAddress}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{log.browser}</div>
                    </td>

                    <td className="p-4 text-slate-600 max-w-xs truncate">
                      {log.reason || "System Activity Logged"}
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
