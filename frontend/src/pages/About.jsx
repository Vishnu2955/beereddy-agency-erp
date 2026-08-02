import { FaInfoCircle, FaShieldAlt, FaCodeBranch, FaCheckCircle, FaBuilding, FaRocket } from "react-icons/fa";

export default function About() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl">
          <FaRocket />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">Beereddy Agency ERP | Version 1.0.0</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Official Production Release • Executive Distributor & Retailer Command Center for V-Bond Tile Adhesives.
          </p>
        </div>
      </div>

      {/* Main Info Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Application Name</span>
            <p className="text-base font-extrabold text-white">Beereddy Agency ERP</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Current Release Version</span>
            <p className="text-base font-mono font-extrabold text-emerald-400">v1.0.0 (Production Stable)</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Build & Deployment Number</span>
            <p className="text-base font-mono font-extrabold text-indigo-300">Build #100 (Final Release)</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-extrabold uppercase">Official Release Date</span>
            <p className="text-base font-extrabold text-white">2 August 2026</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FaShieldAlt className="text-emerald-400" /> Production Core Capabilities (Version 1.0.0)
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Single Admin Executive Command Architecture</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Automated Admin WhatsApp Order Alert Notifications</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Real-Time Inventory Stock Deduction & Reorder Alerts</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Automated Tax Invoice & Credit Limit Accounting</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Cross-Platform Installable Progressive Web App (PWA)</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Automated Daily Encrypted Database Snapshot Backups</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> 8-Step System Self-Check Diagnostics Engine</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Internal Exception Capture & Bug Resolution Tracker</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
