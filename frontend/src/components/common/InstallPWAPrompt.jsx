import { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaShareSquare, FaMobileAlt, FaShieldAlt } from "react-icons/fa";

export default function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed
    const isDismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (isDismissed) return;

    // Detect iOS Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
      setIsVisible(true);
    }

    // Handle Android / Chrome / Edge / Windows / macOS install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted PWA installation");
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_prompt_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 right-4 left-4 lg:left-auto lg:max-w-md z-50 animate-bounce-short">
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-md">
            <FaShieldAlt className="text-lg" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Install Beereddy ERP App</h4>
            <p className="text-[11px] text-slate-400">
              {showIOSPrompt
                ? "Tap Share ➔ Add to Home Screen on iOS Safari"
                : "Install app for fast offline access & instant alerts"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer"
            >
              <FaDownload className="text-xs" /> Install
            </button>
          )}

          {showIOSPrompt && (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <FaShareSquare /> Share
            </span>
          )}

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
