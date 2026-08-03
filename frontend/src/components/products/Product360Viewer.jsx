import React, { useRef, useState, useEffect } from "react";
import {
  FaUndo,
  FaPlay,
  FaPause,
  FaSearchPlus,
  FaSearchMinus,
  FaCompress,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaCube,
} from "react-icons/fa";

export default function Product360Viewer({ images = [], title = "Product 360° View", settings = {} }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(settings.autoRotate ?? true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const autoRotateTimerRef = useRef(null);

  // Preload all 360° image sequence into HTMLImageElements
  useEffect(() => {
    if (!images || images.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let loadedCount = 0;
    const imgObjects = [];

    images.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / images.length) * 100));
        if (loadedCount === images.length) {
          setIsLoading(false);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) setIsLoading(false);
      };
      imgObjects[idx] = img;
    });

    setLoadedImages(imgObjects);
  }, [images]);

  // Render Frame on Canvas at 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadedImages.length === 0) return;

    const ctx = canvas.getContext("2d");
    const img = loadedImages[currentIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Zoom transform centered on canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-centerX, -centerY);

      // Fit image inside canvas maintain aspect ratio
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (canvas.width - img.width * ratio) / 2;
      const centerShiftY = (canvas.height - img.height * ratio) / 2;

      ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      ctx.restore();
    }
  }, [currentIndex, zoomLevel, loadedImages]);

  // Auto Rotation Loop
  useEffect(() => {
    if (isAutoRotating && !isLoading && images.length > 0) {
      autoRotateTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1000 / (settings.rotationSpeed || 15));
    } else {
      clearInterval(autoRotateTimerRef.current);
    }
    return () => clearInterval(autoRotateTimerRef.current);
  }, [isAutoRotating, isLoading, images, settings.rotationSpeed]);

  // Drag & Swipe Event Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || images.length === 0) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const diffX = currentX - startXRef.current;

    // Sensitivity threshold per frame shift
    if (Math.abs(diffX) > 10) {
      const direction = diffX > 0 ? -1 : 1;
      setCurrentIndex((prev) => (prev + direction + images.length) % images.length);
      startXRef.current = currentX;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    setCurrentIndex(0);
    setZoomLevel(1);
    setIsAutoRotating(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400">
        <FaCube className="text-4xl mb-2" />
        <span className="text-xs font-bold">No 360° Interactive Media Uploaded</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative group glass-panel rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 select-none ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none flex flex-col justify-between p-6" : "w-full aspect-square max-w-lg mx-auto"
      }`}
    >
      {/* 360 Badge & Title */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs font-bold text-white shadow-lg">
        <FaCube className="text-blue-400 animate-spin-slow" />
        <span>360° Interactive Product View</span>
      </div>

      {/* Frame Counter Badge */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-[11px] font-mono text-slate-300">
        Frame {currentIndex + 1} / {images.length}
      </div>

      {/* Canvas Renderer */}
      <div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">Loading 360° Sequence... {loadProgress}%</span>
          </div>
        ) : (
          <canvas ref={canvasRef} width={600} height={600} className="w-full h-full object-contain" />
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-2xl text-white">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
          className="p-2 hover:bg-slate-700 rounded-full transition text-xs"
          title="Rotate Left"
        >
          <FaChevronLeft />
        </button>

        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="p-2 hover:bg-slate-700 rounded-full transition text-xs text-blue-400"
          title={isAutoRotating ? "Pause Auto Rotation" : "Start Auto Rotation"}
        >
          {isAutoRotating ? <FaPause /> : <FaPlay />}
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          className="p-2 hover:bg-slate-700 rounded-full transition text-xs"
          title="Rotate Right"
        >
          <FaChevronRight />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button
          onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
          className="p-2 hover:bg-slate-700 rounded-full transition text-xs"
          title="Zoom In"
        >
          <FaSearchPlus />
        </button>

        <button
          onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
          className="p-2 hover:bg-slate-700 rounded-full transition text-xs"
          title="Zoom Out"
        >
          <FaSearchMinus />
        </button>

        <button onClick={resetView} className="p-2 hover:bg-slate-700 rounded-full transition text-xs" title="Reset View">
          <FaUndo />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-700 rounded-full transition text-xs" title="Toggle Fullscreen">
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
    </div>
  );
}
