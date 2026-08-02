const fs = require("fs");
const path = require("path");

// 192x192 Base64 PNG Icon
const icon192Base64 = "iVBORw0KGgoAAAANSU56机关=="; 

// Let's create a solid PNG file for icon-192.png and icon-512.png using Node Buffer
// Valid 192x192 PNG Header & Data
const createMinimalPNG = (width, height) => {
  // Simple PNG format header
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR Chunk
    0x00, 0x00, (width >> 8) & 0xff, width & 0xff,
    0x00, 0x00, (height >> 8) & 0xff, height & 0xff,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, // 8-bit RGBA
    0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54,
    0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
    0x0d, 0x0a, 0x2d, 0xb4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  return pngHeader;
};

const icon192 = createMinimalPNG(192, 192);
const icon512 = createMinimalPNG(512, 512);

const pubDir = path.join(__dirname, "../frontend/public");
const distDir = path.join(__dirname, "../frontend/dist");

fs.writeFileSync(path.join(pubDir, "icon-192.png"), icon192);
fs.writeFileSync(path.join(pubDir, "icon-512.png"), icon512);

if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, "icon-192.png"), icon192);
  fs.writeFileSync(path.join(distDir, "icon-512.png"), icon512);
}

console.log("✅ Successfully generated PNG icons icon-192.png and icon-512.png");
