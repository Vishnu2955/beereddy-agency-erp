import React, { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FaBuilding, FaUser, FaFileInvoice, FaPercentage, FaCheckCircle, FaRocket } from "react-icons/fa";

export default function SetupWizardModal({ isOpen, onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    agencyName: "Beereddy Agency",
    ownerName: "B Upender Reddy",
    gstNumber: "36AAAPB1234A1Z5",
    phone: "9876543210",
    email: "admin@beereddyagency.com",
    address: "Main Road, Near Bus Stand, Dist. Headquarters",
    logo: "/icon-192.png",
    currency: "₹",
    financialYear: "2026-2027",
    invoicePrefix: "BRA",
    defaultTaxPercentage: 18,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/settings/company", {
        ...formData,
        isSetupCompleted: true,
      });

      if (res.data.success) {
        toast.success("🎉 Enterprise setup completed successfully!");
        if (onComplete) onComplete(res.data.settings);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save setup settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
              <FaRocket />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">First-Time ERP Setup Wizard</h2>
              <p className="text-xs text-blue-100 font-medium">Configure your business identity & billing preferences</p>
            </div>
          </div>
          <span className="bg-white/20 text-white font-extrabold text-xs px-3 py-1 rounded-full border border-white/30">
            Step {step} of 2
          </span>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-none">
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FaBuilding className="text-blue-400" /> Agency Identity & Contacts
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Agency Legal Name *</label>
                  <input
                    type="text"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. Beereddy Agency"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proprietor / Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. B Upender Reddy"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:border-blue-500 outline-none uppercase"
                    placeholder="36AAAPB1234A1Z5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                  placeholder="admin@beereddyagency.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address *</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none resize-none"
                  placeholder="Main Road, Near Bus Stand..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FaFileInvoice className="text-indigo-400" /> Billing, Tax & Currency Defaults
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Currency Symbol</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Financial Year</label>
                  <input
                    type="text"
                    name="financialYear"
                    value={formData.financialYear}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                    placeholder="2026-2027"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Prefix *</label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:border-blue-500 outline-none uppercase"
                    placeholder="BRA"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Invoices generated as BRA-1001</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Tax / GST (%)</label>
                  <input
                    type="number"
                    name="defaultTaxPercentage"
                    value={formData.defaultTaxPercentage}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Logo Path</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                  />
                  <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-slate-800 flex items-center justify-center">
                    <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Previous Step
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30"
              >
                Next: Tax & Billing →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                <FaCheckCircle /> {loading ? "Saving Setup..." : "Complete Setup & Launch ERP"}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
