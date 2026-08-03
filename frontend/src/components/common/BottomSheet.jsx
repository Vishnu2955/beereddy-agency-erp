import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end justify-center md:items-center p-0 md:p-4">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl border-t md:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Drag Indicator Handle for Mobile */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title || "Details"}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <FaTimes />
          </button>
        </div>

        {/* Sheet Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
