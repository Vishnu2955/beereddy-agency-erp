import React from "react";
import {
  FaDownload,
  FaTimes,
  FaShareSquare,
  FaMobileAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaPlusSquare,
  FaEllipsisV,
} from "react-icons/fa";
import { usePwa } from "../../context/PwaContext";

export default function InstallPWAPrompt() {
  const {
    isInstalled,
    isIOS,
    showInstallBanner,
    dismissInstallBanner,
    promptInstall,
    showGuideModal,
    setShowGuideModal,
    deferredPrompt,
  } = usePwa();

  // If already installed, don't show prompt
  if (isInstalled) return null;

  return (
    <>
      {/* 1. Automatic Floating Suggestion Banner on Opening Website */}
      {showInstallBanner && !showGuideModal && (
        <div className="fixed bottom-16 lg:bottom-5 right-4 left-4 lg:left-auto lg:max-w-md z-[99990] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-950/95 text-white p-4 rounded-3xl border border-amber-500/40 shadow-2xl backdrop-blur-xl space-y-3 relative overflow-hidden">
            {/* Ambient Backlight Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] p-1 flex items-center justify-center">
                    <img
                      src="/icon-192.png"
                      alt="Beereddy ERP"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/favicon.png";
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Add to Home Screen
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight mt-0.5">
                    Install Beereddy ERP App
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium leading-tight">
                    {isIOS
                      ? "Tap Share ➔ Add to Home Screen for fast access"
                      : "Get fast offline access & real-time order alerts!"}
                  </p>
                </div>
              </div>

              <button
                onClick={dismissInstallBanner}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Quick Benefits Badges */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-semibold text-slate-300 text-center">
              <div className="bg-slate-900/80 py-1 px-2 rounded-xl border border-slate-800 flex items-center justify-center gap-1">
                <FaCheckCircle className="text-amber-400 text-[10px]" /> 1-Tap Access
              </div>
              <div className="bg-slate-900/80 py-1 px-2 rounded-xl border border-slate-800 flex items-center justify-center gap-1">
                <FaCheckCircle className="text-amber-400 text-[10px]" /> Fast Offline
              </div>
              <div className="bg-slate-900/80 py-1 px-2 rounded-xl border border-slate-800 flex items-center justify-center gap-1">
                <FaCheckCircle className="text-amber-400 text-[10px]" /> Live Alerts
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={promptInstall}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs py-2.5 px-3 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                {deferredPrompt ? (
                  <>
                    <FaDownload className="text-xs" /> <span>Install App Now</span>
                  </>
                ) : isIOS ? (
                  <>
                    <FaShareSquare className="text-xs" /> <span>Add to Home Screen</span>
                  </>
                ) : (
                  <>
                    <FaMobileAlt className="text-xs" /> <span>Install / Setup</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowGuideModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <FaInfoCircle className="text-xs text-amber-400" /> Guide
              </button>

              <button
                onClick={dismissInstallBanner}
                className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold px-2 transition cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Comprehensive PWA Installation & Add to Home Screen Modal Guide */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  📲
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Official Mobile App
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                    Add to Home Screen
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Install Beereddy Agency ERP on your mobile or desktop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Instruction Steps based on Browser/Device & Install State */}
            {isIOS ? (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <p className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FaShareSquare /> iOS Safari Instructions:
                </p>
                <div className="space-y-2.5 text-slate-300 font-medium">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button <FaShareSquare className="inline text-amber-400 mx-1" /> at the bottom of Safari.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Scroll down and select <strong>"Add to Home Screen"</strong> <FaPlusSquare className="inline text-amber-400 mx-1" />.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Tap <strong>"Add"</strong> in top right. App icon appears on your home screen!
                    </span>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <p className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FaMobileAlt /> One-Tap App Installation:
                </p>
                <p className="text-slate-300 font-medium leading-relaxed">
                  Click the <strong>"Install App Instantly"</strong> button below to open Chrome's native system dialog and install Beereddy Agency ERP on your device.
                </p>
              </div>
            ) : (
              <div className="space-y-3 bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/40 text-xs">
                <p className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-400" /> App Already Installed in Chrome!
                </p>
                <div className="space-y-2.5 text-slate-200 font-medium leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Look at your browser's address bar at the very top. Click the <strong>"Open in app"</strong> button <span className="bg-slate-800 px-2 py-0.5 rounded text-white border border-slate-700 font-mono text-[10px]">Open in app</span>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Or search for <strong>Beereddy Agency ERP</strong> in your Windows / Desktop applications list to launch as a standalone desktop app!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {deferredPrompt && (
                <button
                  onClick={async () => {
                    setShowGuideModal(false);
                    await promptInstall();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 uppercase tracking-wider transition active:scale-95 cursor-pointer"
                >
                  <FaDownload className="text-xs" /> Install App Instantly
                </button>
              )}

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-2xl transition cursor-pointer"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

