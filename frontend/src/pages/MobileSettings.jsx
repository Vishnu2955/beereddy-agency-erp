import { useState, useEffect } from "react";
import {
  FaMobileAlt,
  FaImage,
  FaUpload,
  FaSave,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import { successToast } from "../utils/toast";

const MOBILE_ICON_PATH = "/icon-192.png";
const BACKGROUND_STORAGE_KEY = "beereddy_mobile_background";
const ICON_STORAGE_KEY = "beereddy_mobile_icon";

export default function MobileSettings() {
  const navigate = useNavigate();
  const user = getUser();
  const [backgroundImage, setBackgroundImage] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [iconFileName, setIconFileName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "retailer") {
      navigate("/settings", { replace: true });
      return;
    }

    const savedBackground = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
    const savedIcon = localStorage.getItem(ICON_STORAGE_KEY);
    if (savedIcon) {
      setIconImage(savedIcon);
    }
    setLoading(false);
  }, [navigate, user]);

  const handleIconUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result?.toString();
      if (dataUrl) {
        setIconImage(dataUrl);
        setIconFileName(file.name);
        localStorage.setItem(ICON_STORAGE_KEY, dataUrl);
        successToast("Icon preview image saved successfully.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBackgroundUrl = () => {
    if (!backgroundUrl) return;
    setBackgroundImage(backgroundUrl);
    localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundUrl);
    successToast("Background image saved successfully.");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result?.toString();
      if (dataUrl) {
        setBackgroundImage(dataUrl);
        localStorage.setItem(BACKGROUND_STORAGE_KEY, dataUrl);
        successToast("Background image uploaded successfully.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetBackground = () => {
    localStorage.removeItem(BACKGROUND_STORAGE_KEY);
    setBackgroundImage("");
    setBackgroundUrl("");
    successToast("Background image reset to default.");
  };

  if (user?.role === "retailer") {
    return null;
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm font-semibold">
              <FaMobileAlt className="text-base" /> Mobile App Icon & Background
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Beereddy Mobile Launcher Customization
            </h1>
            <p className="max-w-2xl text-slate-400 text-sm sm:text-base leading-7">
              Use the app icon in full, remove extra theme controls, and choose a pleasant mobile background that fits your PWA shell perfectly.
            </p>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-slate-800 w-full sm:w-auto shadow-xl">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-6 py-5 flex items-center justify-center">
              <img
                src={iconImage || MOBILE_ICON_PATH}
                alt="App icon preview"
                className="w-28 h-28 object-contain"
              />
            </div>
            <div className="bg-slate-900 px-6 py-4 text-slate-300 text-sm">
              Current mobile app icon preview. Use the upload control below to replace the preview icon, or update <code className="bg-slate-800 px-2 py-1 rounded">public/icon-192.png</code> and <code className="bg-slate-800 px-2 py-1 rounded">public/icon-512.png</code> for the PWA launcher.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Mobile Background Preview</h2>
              <p className="text-slate-400 text-sm mt-1">
                Upload a fresh background image or paste an image URL to personalize the mobile app shell.
              </p>
            </div>
            <div
              className="h-96 bg-cover bg-center"
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : "linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(56, 189, 248, 0.95))",
              }}
            >
              {!backgroundImage && (
                <div className="h-full w-full bg-slate-950/10 flex items-center justify-center text-slate-200 text-lg font-semibold">
                  Pleasant default mobile background
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Background Image URL
                <input
                  type="url"
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  placeholder="https://example.com/background.jpg"
                  className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Upload Background Image
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="file:bg-sky-600 file:text-white file:px-4 file:py-2 file:rounded-full file:border-0 file:hover:bg-sky-500 text-slate-100"
                  />
                </div>
              </label>

              <label className="block text-sm text-slate-300">
                Upload App Icon Preview
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="file:bg-emerald-600 file:text-white file:px-4 file:py-2 file:rounded-full file:border-0 file:hover:bg-emerald-500 text-slate-100"
                  />
                </div>
                {iconFileName && (
                  <p className="mt-2 text-xs text-slate-400">Preview saved: {iconFileName}</p>
                )}
              </label>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSaveBackgroundUrl}
                disabled={!backgroundUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
              >
                <FaSave /> Save Background
              </button>
              <button
                type="button"
                onClick={handleResetBackground}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-white"
              >
                <FaTimes /> Reset to Default
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-900 border border-slate-800 p-5 text-slate-400 text-sm space-y-3">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="mt-1 text-slate-400" />
                <p>
                  For best results, use a clean background image with subtle textures or gradients. The preview above shows the final mobile app shell look.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4">
                <p className="text-slate-300 text-xs">
                  Note: If you want the attached app icon to appear perfectly on mobile launchers, replace the files in <code className="bg-slate-800 px-2 py-1 rounded">public/icon-192.png</code> and <code className="bg-slate-800 px-2 py-1 rounded">public/icon-512.png</code> with your custom icon image.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Clean Mobile Experience</h3>
            <p className="mt-3 text-slate-400 text-sm leading-6">
              This section removes old theme toggles and extra mobile settings options. It focuses only on the mobile app icon preview and background customization so your PWA keeps a clean, polished look.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white">How to apply the icon</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-400 text-sm leading-6">
              <li>Upload your desired mobile icon files to <code className="bg-slate-800 px-2 py-1 rounded">frontend/public/icon-192.png</code> and <code className="bg-slate-800 px-2 py-1 rounded">frontend/public/icon-512.png</code>.</li>
              <li>Choose a pleasant background image here for the mobile PWA shell preview.</li>
              <li>Reload the app or re-install the PWA after changing the icon files to see the updated launcher icon.</li>
              <li>Use a light or dark image with enough contrast so the icon remains visible on the home screen.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
