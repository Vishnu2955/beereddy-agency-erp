import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  FaBuilding,
  FaUserTie,
  FaFileInvoice,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSave,
  FaRedo,
  FaPercentage,
  FaMoneyBillWave,
  FaImage,
} from "react-icons/fa";

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    agencyName: "",
    ownerName: "",
    gstNumber: "",
    phone: "",
    email: "",
    address: "",
    logo: "/icon-192.png",
    currency: "₹",
    financialYear: "2026-2027",
    invoicePrefix: "BRA",
    defaultTaxPercentage: 18,
    isSetupCompleted: true,
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/settings/company");
      if (res.data.success && res.data.settings) {
        setProfile(res.data.settings);
      }
    } catch (err) {
      toast.error("Failed to load company profile settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/settings/company", profile);
      if (res.data.success) {
        toast.success("✅ Company profile settings updated successfully!");
        setProfile(res.data.settings);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving profile settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetWizard = async () => {
    if (!window.confirm("Are you sure you want to re-enable the First-Time Setup Wizard for next login?")) return;
    try {
      const res = await api.post("/settings/company/reset-wizard");
      if (res.data.success) {
        toast.success("Setup wizard reset! It will appear on next page load/login.");
        setProfile((prev) => ({ ...prev, isSetupCompleted: false }));
      }
    } catch (err) {
      toast.error("Failed to reset setup wizard");
    }
  };

  if (loading) {
    return <Loader text="Loading Company Profile..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-wider">
              Commercial Enterprise Profile
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Master System Settings</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Agency & Company Profile</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Configure official business parameters, GSTIN, legal address, invoice prefix, and default tax percentages applied across invoices and reports.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetWizard}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
        >
          <FaRedo /> Relaunch Setup Wizard
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Business Identity & Contact Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-slate-100">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg border border-blue-500/30">
              <FaBuilding />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Agency Identity & Registration</h2>
              <p className="text-xs text-slate-400">Official legal entity details and Tax IDs</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <FaBuilding className="text-blue-400" /> Agency Legal Name *
              </label>
              <input
                type="text"
                name="agencyName"
                value={profile.agencyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <FaUserTie className="text-emerald-400" /> Owner / Proprietor Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={profile.ownerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <FaFileInvoice className="text-purple-400" /> GSTIN Number *
              </label>
              <input
                type="text"
                name="gstNumber"
                value={profile.gstNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:border-blue-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <FaPhoneAlt className="text-indigo-400" /> Contact Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <FaEnvelope className="text-amber-400" /> Primary Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <FaImage className="text-rose-400" /> Company Logo URL
              </label>
              <input
                type="text"
                name="logo"
                value={profile.logo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400" /> Registered Business Address *
            </label>
            <textarea
              name="address"
              rows={3}
              value={profile.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Card 2: Billing & Tax Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-slate-100">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">
              <FaMoneyBillWave />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Billing, Financial & Tax Defaults</h2>
              <p className="text-xs text-slate-400">Invoice numbering format, default tax rates, and currency</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Currency Symbol</label>
              <input
                type="text"
                name="currency"
                value={profile.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Financial Year</label>
              <input
                type="text"
                name="financialYear"
                value={profile.financialYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Invoice Serial Prefix</label>
              <input
                type="text"
                name="invoicePrefix"
                value={profile.invoicePrefix}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:border-blue-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Tax / GST (%)</label>
              <input
                type="number"
                name="defaultTaxPercentage"
                value={profile.defaultTaxPercentage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FaSave /> {saving ? "Saving Changes..." : "Save Company Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}
