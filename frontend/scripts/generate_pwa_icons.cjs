const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createBrandedPng(width, height) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const bgR = 15, bgG = 23, bgB = 42;
  const brandR = 37, brandG = 99, brandB = 235;

  const radius = Math.floor(width * 0.38);
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // None filter

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        rawData[pxOffset] = brandR;
        rawData[pxOffset + 1] = brandG;
        rawData[pxOffset + 2] = brandB;
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
        rawData[pxOffset + 3] = 255;
      }

      if (Math.abs(dx) < radius * 0.6 && dy >= -radius * 0.4 && dy <= radius * 0.4) {
        const expectedY = Math.abs(dx) * 1.2 - radius * 0.3;
        if (Math.abs(dy - expectedY) < width * 0.08) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        }
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = createChunk("IHDR", ihdr);
  const idatChunk = createChunk("IDAT", compressed);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let c = buf[i];
    for (let j = 0; j < 8; j++) {
      let b = (crc ^ c) & 1;
      crc = (crc >>> 1) ^ (b ? 0xedb88320 : 0);
      c >>>= 1;
    }
  }
  return crc ^ -1;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const iconsDir = path.join(__dirname, "../public/icons");
const publicDir = path.join(__dirname, "../public");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log("🎨 Generating PWA Icon Suite...");

sizes.forEach((s) => {
  const png = createBrandedPng(s, s);
  const iconPath = path.join(iconsDir, `icon-${s}x${s}.png`);
  fs.writeFileSync(iconPath, png);
  console.log(`  └─ Generated icon-${s}x${s}.png (${s}x${s})`);

  if (s === 192) fs.writeFileSync(path.join(publicDir, "icon-192.png"), png);
  if (s === 512) fs.writeFileSync(path.join(publicDir, "icon-512.png"), png);
});

console.log("✅ All 8 PWA Icon Sizes Generated Successfully!");
