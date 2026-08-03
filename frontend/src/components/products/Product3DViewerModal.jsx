import { useEffect, useRef, useState } from "react";
import { FaTimes, FaSyncAlt, FaCube, FaShoppingCart, FaSearchPlus, FaSearchMinus, FaFilePdf, FaVideo } from "react-icons/fa";
import Product360Viewer from "./Product360Viewer";

export default function Product360ViewerModal({ product, isOpen, onClose, onAddToCart }) {
  const canvasRef = useRef(null);
  const [rotationX, setRotationX] = useState(0.4);
  const [rotationY, setRotationY] = useState(0.6);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Load product image as texture canvas
  const imageTextureRef = useRef(null);

  useEffect(() => {
    if (!product || !isOpen) return;

    if (product.image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = product.image;
      img.onload = () => {
        imageTextureRef.current = img;
      };
    } else {
      imageTextureRef.current = null;
    }
  }, [product, isOpen]);

  // Auto rotation animation loop
  useEffect(() => {
    if (!isOpen || (product?.viewer360Images && product.viewer360Images.length > 0)) return;

    let animId;
    const render = () => {
      if (autoRotate && !isDragging) {
        setRotationY((prev) => prev + 0.01);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, autoRotate, isDragging, product]);

  // 3D Canvas Renderer
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !product || (product.viewer360Images && product.viewer360Images.length > 0)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dynamic gradient background
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
    bgGradient.addColorStop(0, "#1e293b");
    bgGradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 3D Cube vertices (centered)
    const size = 90 * zoom;
    const vertices = [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
    ];

    // Rotation matrices
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    const projectedVertices = vertices.map(([x, y, z]) => {
      let x1 = x * cosY + z * sinY;
      let y1 = y;
      let z1 = -x * sinY + z * cosY;

      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      const distance = 400;
      const fov = distance / (distance + z2);

      return {
        x: width / 2 + x2 * fov,
        y: height / 2 + y2 * fov,
        z: z2,
        fov,
      };
    });

    const faces = [
      { indices: [0, 1, 2, 3], color: "#2563eb", name: "Back" },
      { indices: [4, 5, 6, 7], color: "#3b82f6", name: "Front" },
      { indices: [0, 1, 5, 4], color: "#1d4ed8", name: "Top" },
      { indices: [2, 3, 7, 6], color: "#1e40af", name: "Bottom" },
      { indices: [0, 3, 7, 4], color: "#60a5fa", name: "Left" },
      { indices: [1, 2, 6, 5], color: "#93c5fd", name: "Right" },
    ];

    faces.forEach((face) => {
      face.avgZ = face.indices.reduce((sum, idx) => sum + projectedVertices[idx].z, 0) / 4;
    });

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach((face) => {
      const pts = face.indices.map((idx) => projectedVertices[idx]);
      const v0 = pts[0];
      const v1 = pts[1];
      const v2 = pts[2];

      const ax = v1.x - v0.x;
      const ay = v1.y - v0.y;
      const bx = v2.x - v0.x;
      const by = v2.y - v0.y;

      const crossZ = ax * by - ay * bx;

      if (crossZ > 0) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.closePath();

        const shade = Math.min(1, Math.max(0.3, Math.abs(face.avgZ / size) + 0.5));
        ctx.fillStyle = face.color;
        ctx.globalAlpha = shade;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (imageTextureRef.current && (face.name === "Front" || face.name === "Right")) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          ctx.lineTo(pts[1].x, pts[1].y);
          ctx.lineTo(pts[2].x, pts[2].y);
          ctx.lineTo(pts[3].x, pts[3].y);
          ctx.closePath();
          ctx.clip();

          const minX = Math.min(...pts.map((p) => p.x));
          const maxX = Math.max(...pts.map((p) => p.x));
          const minY = Math.min(...pts.map((p) => p.y));
          const maxY = Math.max(...pts.map((p) => p.y));

          ctx.drawImage(imageTextureRef.current, minX, minY, maxX - minX, maxY - minY);
          ctx.restore();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        const centerX = (pts[0].x + pts[2].x) / 2;
        const centerY = (pts[0].y + pts[2].y) / 2;
        ctx.fillText(product.productName || "3D Product", centerX, centerY);
      }
    });
  }, [isOpen, product, rotationX, rotationY, zoom]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    setRotationY((prev) => prev + deltaX * 0.01);
    setRotationX((prev) => prev + deltaY * 0.01);

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !product) return null;

  const has360Images = product.viewer360Images && product.viewer360Images.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border border-slate-700 flex flex-col md:flex-row max-h-[90vh]">

        {/* 3D Canvas Area / 360 Viewer */}
        <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 min-h-[380px]">
          {has360Images ? (
            <Product360Viewer
              images={product.viewer360Images}
              title={product.productName}
              settings={product.viewer360Settings || {}}
            />
          ) : (
            <>
              <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                <FaCube className="animate-spin" /> Interactive 3D Canvas Model
              </div>

              <canvas
                ref={canvasRef}
                width={380}
                height={380}
                className="cursor-grab active:cursor-grabbing rounded-xl shadow-inner border border-slate-800"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              <p className="text-xs text-slate-400 mt-2">
                Drag mouse to rotate 3D product preview
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                    autoRotate ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <FaSyncAlt className={autoRotate ? "animate-spin" : ""} /> Auto Rotate
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-xs text-slate-200"
                >
                  <FaSearchPlus />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-xs text-slate-200"
                >
                  <FaSearchMinus />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Product Details Side Panel */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-800">
                {product.category || "General"}
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{product.productName}</h2>
            {product.brand && (
              <p className="text-sm text-slate-400 mb-4">Brand: <span className="text-white">{product.brand}</span></p>
            )}

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Selling Price:</span>
                <span className="text-2xl font-extrabold text-green-400">
                  ₹{Number(product.sellingPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
              {product.mrp > product.sellingPrice && (
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>M.R.P:</span>
                  <span className="line-through">₹{Number(product.mrp).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Available Stock:</span>
                <span className={`font-semibold ${product.stock > 0 ? "text-blue-400" : "text-red-400"}`}>
                  {product.stock > 0 ? `${product.stock} ${product.unit || "PCS"}` : "Out of Stock"}
                </span>
              </div>
            </div>

            {product.description && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                  {product.description}
                </p>
              </div>
            )}

            {/* Video & Brochure Links */}
            <div className="flex flex-col gap-2 mb-4">
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-2"
                >
                  <FaVideo /> Watch Product Video
                </a>
              )}
              {product.brochureUrl && (
                <a
                  href={product.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2"
                >
                  <FaFilePdf /> Download PDF Brochure
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={product.stock <= 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaShoppingCart /> Add to Shopping Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
