import { useState, useEffect } from "react";
import {
  FaPalette,
  FaQrcode,
  FaBuilding,
  FaTrashAlt,
  FaWhatsapp,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaImage,
  FaSlidersH,
  FaSun,
  FaMoon,
  FaRedo,
  FaDownload,
  FaUpload,
  FaStar,
  FaLock,
} from "react-icons/fa";
import { getUser } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { usePwa } from "../context/PwaContext";

export default function Settings() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";
  const { isInstallable, promptInstall } = usePwa();

  const {
    activeThemeId,
    builtinThemes,
    wallpaperPresets,
    customColors,
    wallpaperSettings,
    compactMode,
    favorites,
    selectTheme,
    updateCustomColors,
    updateWallpaper,
    setCompactMode,
    toggleFavorite,
    resetTheme,
  } = useTheme();

  const [activeTab, setActiveTab] = useState("appearance"); // 'appearance' | 'payment' | 'company' | 'reset'

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    adminPayee: "",
    upiVpa: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    accountType: "Current",
    qrImage: "",
  });
  const [qrFile, setQrFile] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState({ type: "", text: "" });

  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    companyName: "BEEREDDY AGENCY",
    dealerTagline: "A Trusted V Bond Distributor",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    gstNumber: "",
    phone: "",
    email: "",
    website: "",
    invoiceFooter: "",
    invoiceTerms: "",
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyMsg, setCompanyMsg] = useState({ type: "", text: "" });

  // WhatsApp State
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState("");
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);
  const [savingWa, setSavingWa] = useState(false);
  const [waMsg, setWaMsg] = useState({ type: "", text: "" });

  // Reset ERP State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resettingErp, setResettingErp] = useState(false);
  const [resetMsg, setResetMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchPaymentSettings();
    fetchCompanySettings();
    if (isAdmin) fetchWhatsAppSettings();
  }, [isAdmin]);

  const fetchPaymentSettings = async () => {
    try {
      const res = await api.get("/settings/payment-details");
      if (res.data.success && res.data.settings) {
        setPaymentSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Fetch Payment Settings Error:", err);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const res = await api.get("/settings/company");
      if (res.data.success && res.data.settings) {
        setCompanySettings(res.data.settings);
      }
    } catch (err) {
      console.error("Fetch Company Settings Error:", err);
    }
  };

  const fetchWhatsAppSettings = async () => {
    try {
      const res = await api.get("/settings/whatsapp");
      if (res.data.success) {
        setAdminWhatsAppNumber(res.data.adminWhatsAppNumber || "");
        setWhatsAppEnabled(Boolean(res.data.whatsAppEnabled));
      }
    } catch (err) {
      console.error("Fetch WhatsApp Settings Error:", err);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentMsg({ type: "", text: "" });
    try {
      const formData = new FormData();
      Object.keys(paymentSettings).forEach((key) => {
        if (key !== "qrImage") formData.append(key, paymentSettings[key]);
      });
      if (qrFile) formData.append("qrImage", qrFile);

      const res = await api.put("/settings/payment-details", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setPaymentMsg({ type: "success", text: "Payment details & QR code updated successfully!" });
        setPaymentSettings(res.data.settings);
        setQrFile(null);
      }
    } catch (err) {
      setPaymentMsg({ type: "error", text: err.response?.data?.message || "Failed to update payment settings." });
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    setCompanyMsg({ type: "", text: "" });
    try {
      const res = await api.put("/settings/company", companySettings);
      if (res.data.success) {
        setCompanyMsg({ type: "success", text: "Company settings updated successfully!" });
      }
    } catch (err) {
      setCompanyMsg({ type: "error", text: err.response?.data?.message || "Failed to update company settings." });
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    setSavingWa(true);
    setWaMsg({ type: "", text: "" });
    try {
      const res = await api.put("/settings/whatsapp", {
        adminWhatsAppNumber,
        whatsAppEnabled,
      });
      if (res.data.success) {
        setWaMsg({ type: "success", text: "WhatsApp notification settings updated!" });
      }
    } catch (err) {
      setWaMsg({ type: "error", text: err.response?.data?.message || "Failed to update WhatsApp settings." });
    } finally {
      setSavingWa(false);
    }
  };

  const handleResetErp = async (e) => {
    e.preventDefault();
    if (!resetPassword) return;
    setResettingErp(true);
    setResetMsg({ type: "", text: "" });
    try {
      const res = await api.post("/settings/reset-erp", { confirmationPassword: resetPassword });
      if (res.data.success) {
        setResetMsg({ type: "success", text: res.data.message });
        setResetModalOpen(false);
        setResetPassword("");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      setResetMsg({ type: "error", text: err.response?.data?.message || "Reset failed. Check password." });
    } finally {
      setResettingErp(false);
    }
  };

  // Export Theme Presets
  const exportThemeJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ activeThemeId, customColors, wallpaperSettings }));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `beereddy-theme-${activeThemeId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaPalette className="text-blue-400" /> Enterprise Settings & Theme Center
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Personalize your ERP appearance, manage payment options, and update company details.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
            >
              <FaDownload /> Install PWA App
            </button>
          )}
          <button
            onClick={resetTheme}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
          >
            <FaRedo /> Reset Theme
          </button>
          <button
            onClick={exportThemeJson}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <FaDownload /> Export Theme
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
            activeTab === "appearance"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          }`}
        >
          <FaPalette /> Appearance & Themes (30)
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
            activeTab === "payment"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          }`}
        >
          <FaQrcode /> Official Payment Settings
        </button>
        <button
          onClick={() => setActiveTab("company")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
            activeTab === "company"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          }`}
        >
          <FaBuilding /> Company Settings
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("reset")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === "reset"
                ? "bg-red-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50"
            }`}
          >
            <FaTrashAlt /> WhatsApp & Reset ERP
          </button>
        )}
      </div>

      {/* TAB 1: APPEARANCE & THEME ENGINE */}
      {activeTab === "appearance" && (
        <div className="space-y-8">
          {/* UI Display Mode */}
          <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Interface Mode & Spacing</h3>
              <p className="text-xs text-slate-500">Toggle between Comfort Mode and Compact Data Density</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  compactMode ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-800 border-slate-300"
                }`}
              >
                {compactMode ? "Compact Mode Active" : "Comfort Mode Active"}
              </button>
            </div>
          </div>

          {/* Built-in Theme Selector Grid */}
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Choose Professional Built-In Theme</span>
              <span className="text-xs font-normal text-slate-500">30 Curated Themes</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {builtinThemes.map((theme) => {
                const isSelected = activeThemeId === theme.id;
                const isFav = favorites.includes(theme.id);
                return (
                  <div
                    key={theme.id}
                    onClick={() => selectTheme(theme.id)}
                    className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:scale-[1.02] shadow-sm ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/50 bg-white dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{theme.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(theme.id);
                          }}
                          className="text-amber-400 hover:text-amber-500 text-sm"
                        >
                          <FaStar className={isFav ? "fill-amber-400" : "text-slate-300"} />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">{theme.desc}</p>
                    </div>

                    {/* Color Swatch Preview Bar */}
                    <div className="h-6 rounded-lg overflow-hidden flex border border-slate-200 dark:border-slate-700">
                      <div className="h-full w-1/3" style={{ background: theme.primary }} />
                      <div className="h-full w-1/3" style={{ background: theme.accent }} />
                      <div className="h-full w-1/3" style={{ background: theme.bg }} />
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 text-[10px]">
                        <FaCheckCircle />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Theme Builder */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaSlidersH className="text-blue-600" /> Custom Theme Builder
            </h3>
            <p className="text-xs text-slate-500">Fine-tune primary, accent, card, and background colors to match your brand exactly.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Color</label>
                <input
                  type="color"
                  value={customColors.primary || "#2563eb"}
                  onChange={(e) => updateCustomColors({ primary: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Accent Color</label>
                <input
                  type="color"
                  value={customColors.accent || "#06b6d4"}
                  onChange={(e) => updateCustomColors({ accent: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Background</label>
                <input
                  type="color"
                  value={customColors.bg || "#f8fafc"}
                  onChange={(e) => updateCustomColors({ bg: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Sidebar Color</label>
                <input
                  type="color"
                  value={customColors.sidebarBg || "#0f172a"}
                  onChange={(e) => updateCustomColors({ sidebarBg: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Card Background</label>
                <input
                  type="color"
                  value={customColors.cardBg || "#ffffff"}
                  onChange={(e) => updateCustomColors({ cardBg: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Border Radius</label>
                <select
                  value={customColors.borderRadius || "12px"}
                  onChange={(e) => updateCustomColors({ borderRadius: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-300 text-xs px-2"
                >
                  <option value="4px">Square (4px)</option>
                  <option value="8px">Soft (8px)</option>
                  <option value="12px">Rounded (12px)</option>
                  <option value="18px">Pill (18px)</option>
                  <option value="24px">Extra Rounded (24px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Background Wallpaper Library & Advanced Image Controls */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaImage className="text-blue-600" /> Background Wallpaper Library & Adjustments
            </h3>

            {/* Presets Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {wallpaperPresets.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => updateWallpaper({ url: wp.url })}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 h-20 relative flex items-end p-2 transition ${
                    wallpaperSettings.url === wp.url ? "border-blue-600 ring-2 ring-blue-500/50" : "border-slate-200"
                  }`}
                  style={{
                    background: wp.url ? `url(${wp.url}) center/cover` : "#e2e8f0",
                  }}
                >
                  <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-sm truncate">
                    {wp.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom URL Upload */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter custom image background URL..."
                value={wallpaperSettings.url || ""}
                onChange={(e) => updateWallpaper({ url: e.target.value })}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              />
              <button
                onClick={() => updateWallpaper({ url: "" })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
              >
                Clear Wallpaper
              </button>
            </div>

            {/* Advanced Controls: Blur, Brightness, Opacity, Contrast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Blur Level</span>
                  <span>{wallpaperSettings.blur || 0}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={wallpaperSettings.blur || 0}
                  onChange={(e) => updateWallpaper({ blur: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Brightness</span>
                  <span>{wallpaperSettings.brightness || 100}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={wallpaperSettings.brightness || 100}
                  onChange={(e) => updateWallpaper({ brightness: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Contrast</span>
                  <span>{wallpaperSettings.contrast || 100}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={wallpaperSettings.contrast || 100}
                  onChange={(e) => updateWallpaper({ contrast: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Saturation</span>
                  <span>{wallpaperSettings.saturation || 100}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={wallpaperSettings.saturation || 100}
                  onChange={(e) => updateWallpaper({ saturation: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL PAYMENT SETTINGS */}
      {activeTab === "payment" && (
        <form onSubmit={handleSavePayment} className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
            <FaQrcode className="text-blue-600" /> Admin Official Payment Methods & QR Code
          </h2>

          {paymentMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-bold ${paymentMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {paymentMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Bank Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Bank Account & UPI Info</h3>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={paymentSettings.accountName}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, accountName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={paymentSettings.bankName}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={paymentSettings.accountNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={paymentSettings.ifsc}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, ifsc: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Branch</label>
                  <input
                    type="text"
                    value={paymentSettings.branch || ""}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, branch: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={paymentSettings.upiVpa}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, upiVpa: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Right: Upload Official Static QR Code */}
            <div className="space-y-4 border-l pl-6 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Official QR Code Image</h3>
              <p className="text-xs text-slate-500">Upload high-resolution official UPI QR Image. Displayed uncompressed to retailers.</p>

              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 dark:bg-slate-900">
                {paymentSettings.qrImage ? (
                  <img
                    src={paymentSettings.qrImage}
                    alt="Official QR Code"
                    className="w-48 h-48 object-contain rounded-xl shadow-md border bg-white p-2 mb-3"
                  />
                ) : (
                  <FaQrcode className="text-5xl text-slate-400 mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingPayment}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
            >
              <FaSave /> {savingPayment ? "Saving Payment Settings..." : "Save Payment Details"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: COMPANY SETTINGS */}
      {activeTab === "company" && (
        <form onSubmit={handleSaveCompany} className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
            <FaBuilding className="text-blue-600" /> Distributor Company Information
          </h2>

          {companyMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-bold ${companyMsg.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {companyMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dealer Tagline</label>
              <input
                type="text"
                value={companySettings.dealerTagline}
                onChange={(e) => setCompanySettings({ ...companySettings, dealerTagline: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={companySettings.gstNumber}
                onChange={(e) => setCompanySettings({ ...companySettings, gstNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={companySettings.phone}
                onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={companySettings.city}
                onChange={(e) => setCompanySettings({ ...companySettings, city: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">State & Pincode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={companySettings.state}
                  onChange={(e) => setCompanySettings({ ...companySettings, state: e.target.value })}
                  className="w-2/3 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={companySettings.pincode}
                  onChange={(e) => setCompanySettings({ ...companySettings, pincode: e.target.value })}
                  className="w-1/3 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Business Address</label>
            <input
              type="text"
              value={companySettings.address}
              onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Invoice Footer Note</label>
              <textarea
                rows="3"
                value={companySettings.invoiceFooter}
                onChange={(e) => setCompanySettings({ ...companySettings, invoiceFooter: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Invoice Terms & Conditions</label>
              <textarea
                rows="3"
                value={companySettings.invoiceTerms}
                onChange={(e) => setCompanySettings({ ...companySettings, invoiceTerms: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingCompany}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
            >
              <FaSave /> {savingCompany ? "Updating Company Info..." : "Save Company Information"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: WHATSAPP & RESET ERP */}
      {activeTab === "reset" && isAdmin && (
        <div className="space-y-6">
          {/* WhatsApp Admin Settings */}
          <form onSubmit={handleSaveWhatsApp} className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
              <FaWhatsapp className="text-emerald-500" /> WhatsApp Order Notifications
            </h2>

            {waMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-bold ${waMsg.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                {waMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin WhatsApp Destination Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={adminWhatsAppNumber}
                  onChange={(e) => setAdminWhatsAppNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  required
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="waEnable"
                  checked={whatsAppEnabled}
                  onChange={(e) => setWhatsAppEnabled(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="waEnable" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Enable Automated WhatsApp Order Summaries
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingWa}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <FaSave /> {savingWa ? "Saving..." : "Save WhatsApp Settings"}
              </button>
            </div>
          </form>

          {/* STORAGE USAGE & CACHE DIAGNOSTICS */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Storage Diagnostics & Cache</h3>
                <p className="text-[11px] text-slate-400">Local storage consumption and service worker cache control</p>
              </div>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    if ("caches" in window) {
                      caches.keys().then((names) => {
                        names.forEach((name) => caches.delete(name));
                      });
                    }
                    alert("App local cache and storage cleared successfully!");
                    window.location.reload();
                  } catch (_) {}
                }}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition"
              >
                Clear App Cache
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">LOCAL STORAGE</span>
                <strong className="text-slate-800 dark:text-white font-mono text-sm">
                  {typeof window !== "undefined" ? Math.round((JSON.stringify(localStorage).length / 1024) * 10) / 10 : 0} KB
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">ACTIVE THEME</span>
                <strong className="text-slate-800 dark:text-white uppercase font-mono text-sm">{activeThemeId}</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">APP VERSION</span>
                <strong className="text-slate-800 dark:text-white font-mono text-sm">v2.5.0-PROD</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">SERVICE WORKER</span>
                <strong className="text-emerald-600 font-mono text-sm">
                  {typeof window !== "undefined" && "serviceWorker" in navigator ? "Active" : "Disabled"}
                </strong>
              </div>
            </div>
          </div>

          {/* RESET ERP DANGER ZONE */}
          <div className="glass-panel p-6 rounded-2xl border border-red-300 bg-red-50/30 space-y-4">
            <div className="flex items-center gap-3 text-red-600 font-extrabold text-lg border-b border-red-200 pb-3">
              <FaExclamationTriangle /> Danger Zone: Reset ERP as NEW
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Resetting the ERP will permanently delete all <strong>Orders, Invoices, Payments, Retailers, Products, Notifications, Stock History, and Reports</strong>. Admin login, payment settings, and company metadata will be preserved.
            </p>

            {resetMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-bold ${resetMsg.type === "success" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                {resetMsg.text}
              </div>
            )}

            <button
              onClick={() => setResetModalOpen(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
            >
              <FaTrashAlt /> Reset ERP System Data
            </button>
          </div>

          {/* Master Password Reset Modal */}
          {resetModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleResetErp} className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-red-200 space-y-4" autoComplete="off">
                <h3 className="text-lg font-extrabold text-red-600 flex items-center gap-2">
                  <FaExclamationTriangle /> Confirm ERP Master Reset
                </h3>
                <p className="text-xs text-slate-600">
                  This action is IRREVERSIBLE. Please enter your Admin account password to authorize resetting all ERP data to zero.
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Admin Master Password</label>
                  <input
                    type="password"
                    placeholder="Enter Admin Password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-2 rounded-xl border border-red-300 text-xs font-mono"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resettingErp}
                    className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    {resettingErp ? "Resetting ERP..." : "CONFIRM FULL RESET"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}