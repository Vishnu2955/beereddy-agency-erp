import React, { createContext, useContext, useState, useEffect } from "react";
import { FaSyncAlt, FaTimes } from "react-icons/fa";

const PwaContext = createContext();

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // New Version Available PWA States
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("🎉 Beereddy Agency ERP PWA successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Automatic Service Worker Update Detection
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        // Check if there is already a worker waiting to activate
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setUpdateAvailable(true);
        }

        // Listen for future update detections
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setWaitingWorker(installingWorker);
                setUpdateAvailable(true);
                console.log("🚀 [PWA Update Detection] New version is available!");
              }
            };
          }
        };
      });

      // Reload app when new service worker takes controller control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          console.log("⚡ Controller changed! Reloading page for new app version...");
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted PWA installation");
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  const applyUpdate = () => {
    if (waitingWorker) {
      console.log("Sending SKIP_WAITING to waiting service worker...");
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: isInstallable && !isInstalled,
        isInstalled,
        promptInstall,
        showGuideModal,
        setShowGuideModal,
        updateAvailable,
        applyUpdate,
      }}
    >
      {children}

      {/* Floating Glassmorphic App Update Notification Banner */}
      {updateAvailable && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[94%] max-w-md bg-slate-900/95 backdrop-blur-2xl border border-amber-500/50 text-white p-4 rounded-3xl shadow-2xl shadow-amber-950/80 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0 border border-amber-500/30">
              🚀
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wider text-white uppercase">App Update Available!</h4>
              <p className="text-[11px] text-slate-300 font-semibold">New version ready with latest features & fixes.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={applyUpdate}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer"
            >
              <FaSyncAlt className="text-xs animate-spin" /> Update Now
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="text-slate-400 hover:text-white p-1 text-xs transition cursor-pointer"
              title="Dismiss for now"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}

