import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/common/MobileBottomNav";
import InstallPWAPrompt from "../components/common/InstallPWAPrompt";
import GlobalSearchModal from "../components/common/GlobalSearchModal";
import FloatingActionButton from "../components/common/FloatingActionButton";

import SetupWizardModal from "../components/common/SetupWizardModal";
import api from "../services/api";
import { getUser } from "../utils/auth";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  // Check if first-time setup wizard needs to launch
  useEffect(() => {
    if (!isAdmin) return;
    api.get("/settings/company")
      .then((res) => {
        if (res.data.success && res.data.settings && res.data.settings.isSetupCompleted === false) {
          setShowSetupWizard(true);
        }
      })
      .catch((_) => {});
  }, [isAdmin]);

  // Global Keyboard Shortcut: Ctrl + K or Cmd + K or /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white pb-20 lg:pb-0">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

      {/* First-Time Setup Wizard Modal */}
      <SetupWizardModal
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={() => setShowSetupWizard(false)}
      />

      {/* Global Enterprise Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Floating Action Button */}
      <FloatingActionButton />

      {/* PWA Mobile Bottom Navigation Bar & Installation Banner */}
      <MobileBottomNav />
      <InstallPWAPrompt />
    </div>
  );
}