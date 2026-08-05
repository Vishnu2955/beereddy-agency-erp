import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  FaDatabase,
  FaDownload,
  FaUpload,
  FaHistory,
  FaUndoAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileCode,
} from "react-icons/fa";

export default function BackupRestore() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const fetchBackups = async () => {
    try {
      const res = await api.get("/backup/list");
      if (res.data.success) {
        setBackups(res.data.backups || []);
      }
    } catch (err) {
      toast.error("Failed to load database backups list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post("/backup/create");
      if (res.data.success) {
        toast.success("🎉 Full JSON Database Snapshot Created!");
        // Download file directly
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.backupData, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", res.data.filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        fetchBackups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (filename) => {
    if (!window.confirm(`⚠️ WARNING: Restoring from ${filename} will overwrite active data. Continue?`)) return;
    setRestoring(true);
    try {
      const res = await api.post("/backup/restore", {
        filename,
        confirmKey: "RESTORE_CONFIRM",
      });
      if (res.data.success) {
        toast.success("✅ Database Restored Successfully!");
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restore backup");
    } finally {
      setRestoring(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error("Please select a JSON backup file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    setRestoring(true);
    try {
      const res = await api.post("/backup/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success("🎉 Database imported & restored successfully!");
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to import backup");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider">
              Disaster Recovery & Data Resilience
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Master System Utilities</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Database Backup & Restore</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Export full JSON database snapshots, download historical backups, or upload JSON backup files to restore ERP records.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <FaDownload /> {creating ? "Generating Backup..." : "Create & Download JSON Backup"}
        </button>
      </div>

      {/* Grid: Upload & Import + Available Backups List */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Upload & Restore Card */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg border border-blue-500/30">
                <FaUpload />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Import & Restore JSON</h2>
                <p className="text-xs text-slate-400">Restore ERP data from JSON file</p>
              </div>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center space-y-3 transition bg-slate-950/50">
                <FaFileCode className="text-3xl text-blue-400 mx-auto" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">Choose JSON file</span> or drag & drop
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                <FaExclamationTriangle className="text-amber-400 shrink-0 mt-0.5" />
                <span>Restoring will overwrite current database records with the contents of the backup JSON file.</span>
              </div>

              <button
                type="submit"
                disabled={restoring || !importFile}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FaUndoAlt /> {restoring ? "Restoring Database..." : "Import & Restore ERP Data"}
              </button>
            </form>
          </div>
        </div>

        {/* Available Backups List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-lg border border-purple-500/30">
                <FaHistory />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Historical Backups List</h2>
                <p className="text-xs text-slate-400">Server-side database backup snapshots</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{backups.length} Saved Snapshots</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-400">Loading backups list...</div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-slate-800/80 rounded-2xl bg-slate-950/40">
              No historical backup files found. Click "Create & Download JSON Backup" above to generate your first snapshot.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-none">
              {backups.map((b) => (
                <div
                  key={b.filename}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-white truncate max-w-xs">{b.filename}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{(b.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{new Date(b.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRestore(b.filename)}
                      disabled={restoring}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <FaUndoAlt /> Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
