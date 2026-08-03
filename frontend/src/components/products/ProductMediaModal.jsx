import React, { useState } from "react";
import {
  FaTimes,
  FaUpload,
  FaImage,
  FaCube,
  FaVideo,
  FaFilePdf,
  FaTrash,
  FaSave,
  FaCheck,
  FaPlus,
} from "react-icons/fa";
import api from "../../services/api";

export default function ProductMediaModal({ product, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState("main"); // 'main' | 'gallery' | '360' | 'video' | 'pdf'

  const [mainImage, setMainImage] = useState(product?.mainImage || product?.image || "");
  const [galleryImages, setGalleryImages] = useState(product?.galleryImages || []);
  const [viewer360Images, setViewer360Images] = useState(product?.viewer360Images || []);
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl || "");
  const [brochureUrl, setBrochureUrl] = useState(product?.brochureUrl || "");
  const [model3dUrl, setModel3dUrl] = useState(product?.model3dUrl || "");
  const [viewerSettings, setViewerSettings] = useState(
    product?.viewer360Settings || { enabled: true, autoRotate: true, rotationSpeed: 15 }
  );

  const [newGalleryInput, setNewGalleryInput] = useState("");
  const [new360Input, setNew360Input] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAddGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    setGalleryImages([...galleryImages, newGalleryInput.trim()]);
    setNewGalleryInput("");
  };

  const handleRemoveGalleryImage = (idx) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleAdd360Image = () => {
    if (!new360Input.trim()) return;
    setViewer360Images([...viewer360Images, new360Input.trim()]);
    setNew360Input("");
  };

  const handleRemove360Image = (idx) => {
    setViewer360Images(viewer360Images.filter((_, i) => i !== idx));
  };

  const handleSaveMedia = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        mainImage,
        image: mainImage,
        galleryImages,
        viewer360Images,
        videoUrl,
        brochureUrl,
        model3dUrl,
        viewer360Settings: viewerSettings,
      };

      const res = await api.put(`/products/${product._id}`, payload);
      if (res.data.success) {
        setMessage({ type: "success", text: "Product media saved successfully!" });
        if (onUpdated) onUpdated(res.data.product);
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update media." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <FaCube className="text-blue-400" /> Media & 360° View Manager
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Manage product photos, 360° rotation sequence, video link, and PDF brochures for {product.productName}.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={() => setActiveTab("main")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "main" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaImage /> Main Image
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "gallery" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaImage /> Photo Gallery ({galleryImages.length})
          </button>
          <button
            onClick={() => setActiveTab("360")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "360" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaCube /> 360° Sequence ({viewer360Images.length})
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "video" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaVideo /> Video & 3D Model
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "pdf" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600"
            }`}
          >
            <FaFilePdf /> Brochure PDF
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {message.text}
            </div>
          )}

          {/* TAB 1: MAIN IMAGE */}
          {activeTab === "main" && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 block">Main Product Image URL</label>
              <input
                type="text"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="https://example.com/main_photo.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
              {mainImage && (
                <div className="flex justify-center p-4 border rounded-2xl bg-slate-50">
                  <img src={mainImage} alt="Main preview" className="w-48 h-48 object-contain rounded-xl" />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Image URL to add to gallery..."
                  value={newGalleryInput}
                  onChange={(e) => setNewGalleryInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <FaPlus /> Add Image
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative group border rounded-xl overflow-hidden aspect-square bg-slate-50 p-2">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full text-xs opacity-80 group-hover:opacity-100 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 360 DEGREE SEQUENCE */}
          {activeTab === "360" && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-2xl border border-blue-200 dark:border-slate-700 text-xs text-blue-900 dark:text-blue-200">
                💡 Upload 8 to 72 rotated images captured sequentially around the product to automatically render a 60 FPS rotatable view.
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 360 Frame Image URL..."
                  value={new360Input}
                  onChange={(e) => setNew360Input(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAdd360Image}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <FaPlus /> Add Frame
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 border rounded-2xl">
                {viewer360Images.map((url, idx) => (
                  <div key={idx} className="relative border rounded-lg overflow-hidden aspect-square bg-slate-900 p-1 flex items-center justify-center">
                    <img src={url} alt={`360 Frame ${idx}`} className="w-full h-full object-contain" />
                    <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1 rounded">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove360Image(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-[10px]"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              {/* 360 Settings */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRot"
                    checked={viewerSettings.autoRotate}
                    onChange={(e) => setViewerSettings({ ...viewerSettings, autoRotate: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="autoRot" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Auto-Rotation Default
                  </label>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rotation Speed (FPS)</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={viewerSettings.rotationSpeed}
                    onChange={(e) => setViewerSettings({ ...viewerSettings, rotationSpeed: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIDEO & 3D MODEL */}
          {activeTab === "video" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Video URL (MP4, WEBM or YouTube)</label>
                <input
                  type="text"
                  placeholder="https://example.com/product_demo.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">3D Interactive Model URL (GLB / GLTF / USDZ / OBJ)</label>
                <input
                  type="text"
                  placeholder="https://example.com/model3d.glb"
                  value={model3dUrl}
                  onChange={(e) => setModel3dUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PDF BROCHURE */}
          {activeTab === "pdf" && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">PDF Technical Brochure URL</label>
              <input
                type="text"
                placeholder="https://example.com/product_brochure.pdf"
                value={brochureUrl}
                onChange={(e) => setBrochureUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSaveMedia}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <FaSave /> {saving ? "Saving Media..." : "Save Product Media"}
          </button>
        </div>
      </div>
    </div>
  );
}
