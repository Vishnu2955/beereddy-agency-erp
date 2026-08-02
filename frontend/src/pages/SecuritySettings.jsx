import { useEffect, useState } from "react";
import {
  FaSlidersH,
  FaClock,
  FaLock,
  FaKey,
  FaCloudUploadAlt,
  FaSave,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../services/api";
import { successToast, errorToast } from "../utils/toast";

export default function SecuritySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    lockDurationMinutes: 15,
    rememberMeDays: 30,
    passwordMinLength: 10,
    maxUploadSizeMB: 10,
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/security/settings");
      if (res.data.success && res.data.settings) {
        setForm(res.data.settings);
      }
    } catch (err) {
      console.error("Load Security Settings Error:", err);
      errorToast("Failed to load security settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put("/security/settings", form);
      if (res.data.success) {
        successToast("Security policy settings updated successfully!");
        setForm(res.data.settings);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to save security settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading Security Policy Parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl">
            <FaSlidersH />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Security Policy & Governance Settings</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Configure session expiration, login lockout thresholds, password policies, and file upload limits.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Timeout */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaClock className="text-indigo-400" /> Inactivity Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              name="sessionTimeoutMinutes"
              value={form.sessionTimeoutMinutes}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm font-mono focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">Auto logout user after specified minutes of inactivity.</p>
          </div>

          {/* Max Failed Login Attempts */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaLock className="text-amber-400" /> Max Failed Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              name="maxLoginAttempts"
              value={form.maxLoginAttempts}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm font-mono focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">Number of failed password attempts before account lockout.</p>
          </div>

          {/* Lockout Duration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaLock className="text-red-400" /> Account Lockout Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              name="lockDurationMinutes"
              value={form.lockDurationMinutes}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm font-mono focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">Time an account remains locked after exceeding max attempts.</p>
          </div>

          {/* Remember Me Duration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaKey className="text-emerald-400" /> Remember Me Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              name="rememberMeDays"
              value={form.rememberMeDays}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm font-mono focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">JWT token lifetime when Remember Me is selected.</p>
          </div>

          {/* Minimum Password Length */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaShieldAlt className="text-purple-400" /> Password Policy Min Length
            </label>
            <input
              type="number"
              min="8"
              max="32"
              name="passwordMinLength"
              value={form.passwordMinLength}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm font-mono focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">Minimum characters required for passwords.</p>
          </div>

          {/* Max Upload Size */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaCloudUploadAlt className="text-blue-400" /> Maximum Upload Size (MB)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              name="maxUploadSizeMB"
              value={form.maxUploadSizeMB}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm font-mono focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">Maximum allowed file payload size in Megabytes.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
          >
            <FaSave /> {saving ? "Saving Changes..." : "Save Security Policy"}
          </button>
        </div>
      </form>
    </div>
  );
}
