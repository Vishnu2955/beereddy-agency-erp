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
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

    // Live Build Timestamp & Version Polling for Instant Mobile Updates
    let currentBuildTime = localStorage.getItem("beereddy_app_build_time");

    const checkServerVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.buildTime) {
            if (!currentBuildTime) {
              localStorage.setItem("beereddy_app_build_time", data.buildTime);
              currentBuildTime = data.buildTime;
            } else if (Number(data.buildTime) > Number(currentBuildTime)) {
              console.log("🚀 [Instant Mobile Update Detected] Server build is newer!", data);
              setUpdateAvailable(true);
              setShowUpdateModal(true);
            }
          }
        }
      } catch (err) {
        // Silently catch fetch errors
      }
    };

    // Initial check & interval every 15 seconds
    checkServerVersion();
    const versionInterval = setInterval(checkServerVersion, 15000);

    // Automatic Service Worker Update Detection & Periodic Background Checks
    if ("serviceWorker" in navigator) {
      let currentReg = null;

      const checkForUpdate = () => {
        if (currentReg) {
          currentReg.update().catch(() => {});
        } else {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) {
              currentReg = reg;
              reg.update().catch(() => {});
            }
          });
        }
      };

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        currentReg = reg;

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setUpdateAvailable(true);
          setShowUpdateModal(true);
        }

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
                setShowUpdateModal(true);
                console.log("🚀 [PWA Update Detection] New version is available!");
              }
            };
          }
        };
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          console.log("⚡ Controller changed! Reloading page for new app version...");
          window.location.reload();
        }
      });

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          checkForUpdate();
          checkServerVersion();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      checkForUpdate();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearInterval(versionInterval);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  const applyUpdate = async () => {
    try {
      console.log("⚡ Purging caches and activating new app build...");
      // Update stored build timestamp
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.buildTime) {
          localStorage.setItem("beereddy_app_build_time", data.buildTime);
        }
      }

      // Purge all Service Worker Caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Skip waiting on active SW
      if (waitingWorker) {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
      }

      // Hard reload page
      window.location.reload(true);
    } catch (err) {
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
        showUpdateModal,
        setShowUpdateModal,
      }}
    >
      {children}

      {/* Prominent High-Priority Update Popup Modal for Mobile APK & PWAs */}
      {(showUpdateModal || updateAvailable) && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 text-white animate-in zoom-in-95">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 animate-bounce">
              🚀
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                New Version Available
              </span>
              <h3 className="text-xl font-black text-white tracking-tight pt-2">
                Update Mobile App
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                A new version of <strong>Beereddy Agency ERP</strong> is deployed! Tap below to update instantly without reinstalling.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={applyUpdate}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black py-4 rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <FaSyncAlt className="text-sm animate-spin" /> Update App Now
              </button>

              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateAvailable(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 font-bold transition pt-1 cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Mobile Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center border border-emerald-200 text-3xl shadow-inner">
              📲
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Install Beereddy Agency ERP</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                Install our official Web APK app on your device for instant access and live updates!
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Tap Browser Menu <strong>(⋮)</strong> or Share Icon <strong>(⎋)</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-emerald-900/20 transition active:scale-95 cursor-pointer"
            >
              Got It
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

