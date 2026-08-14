import React, { createContext, useContext, useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { successToast, infoToast } from "../utils/toast";

const PwaContext = createContext();

export function PwaProvider({ children }) {


  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

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

    // Detect iOS Safari
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iosDevice);

    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
    } else {
      // Auto suggest installation when opening website if not dismissed recently in session
      const dismissedInSession = sessionStorage.getItem("pwa_prompt_dismissed_session");
      if (!dismissedInSession) {
        // Slight delay so app loads smoothly first
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }

    // Check if early prompt event was already captured on window
    if (window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
      if (!isStandalone && !sessionStorage.getItem("pwa_prompt_dismissed_session")) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      console.log("🎉 Beereddy Agency ERP PWA successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Live Build Timestamp & Version Polling for Instant Mobile & Web In-App Updates
    let currentBuildTime = localStorage.getItem("beereddy_app_build_time");

    const checkServerVersion = async () => {
      try {
        let res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) {
          res = await fetch(`/api/system/version?t=${Date.now()}`, { cache: "no-store" });
        }
        if (res.ok) {
          const data = await res.json();
          if (data && data.buildTime) {
            if (!currentBuildTime) {
              localStorage.setItem("beereddy_app_build_time", data.buildTime);
              currentBuildTime = data.buildTime;
            } else if (Number(data.buildTime) > Number(currentBuildTime)) {
              console.log("🚀 [Instant Mobile/Web Update Detected] Server build is newer!", data);
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
          currentReg.update().catch(() => { });
        } else {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) {
              currentReg = reg;
              reg.update().catch(() => { });
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
    setShowGuideModal(false);
    const targetPrompt = deferredPrompt || window.deferredPwaPrompt;
    if (targetPrompt) {
      try {
        targetPrompt.prompt();
        const { outcome } = await targetPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setShowInstallBanner(false);
          successToast("🎉 Beereddy Agency ERP App installed successfully!");
        }
        setDeferredPrompt(null);
        window.deferredPwaPrompt = null;
      } catch (err) {
        successToast("📲 Triggering App Installation...");
      }
    } else if (isInstalled) {
      infoToast("🚀 Beereddy Agency ERP App is already installed on your device!");
      setShowInstallBanner(false);
    } else {
      successToast("📲 Triggering App Installation...");
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_prompt_dismissed_session", "true");
  };

  const triggerShowInstallModal = () => {
    if (deferredPrompt) {
      promptInstall();
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
        deferredPrompt,
        isInstallable: isInstallable || !!deferredPrompt,
        isInstalled,
        isIOS,
        showInstallBanner,
        setShowInstallBanner,
        dismissInstallBanner,
        promptInstall,
        triggerShowInstallModal,
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
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}


