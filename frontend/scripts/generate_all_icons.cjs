const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const logoPath = path.join(__dirname, "../../images/logo/logo1.jpg");
const publicDir = path.join(__dirname, "../public");
const iconsDir = path.join(publicDir, "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log("🎨 Starting V-BOND Beereddy Agency Icon Generation from:", logoPath);

  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found at ${logoPath}`);
  }

  const metadata = await sharp(logoPath).metadata();
  console.log(`  Source logo size: ${metadata.width}x${metadata.height}`);

  const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 384, 512];

  for (const s of sizes) {
    const padding = Math.floor(s * 0.1);
    const logoSize = s - padding * 2;

    const resizedLogo = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    const finalIcon = await sharp({
      create: {
        width: s,
        height: s,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toBuffer();

    if ([72, 96, 128, 144, 152, 192, 384, 512].includes(s)) {
      const outPath = path.join(iconsDir, `icon-${s}x${s}.png`);
      fs.writeFileSync(outPath, finalIcon);
      console.log(`  └─ Saved ${outPath}`);
    }

    if (s === 192) {
      fs.writeFileSync(path.join(publicDir, "icon-192.png"), finalIcon);
      fs.writeFileSync(path.join(publicDir, "android-chrome-192x192.png"), finalIcon);
    }
    if (s === 512) {
      fs.writeFileSync(path.join(publicDir, "icon-512.png"), finalIcon);
      fs.writeFileSync(path.join(publicDir, "android-chrome-512x512.png"), finalIcon);
    }
    if (s === 180) {
      fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), finalIcon);
    }
    if (s === 32) {
      fs.writeFileSync(path.join(publicDir, "favicon-32x32.png"), finalIcon);
      fs.writeFileSync(path.join(publicDir, "favicon.png"), finalIcon);
    }
    if (s === 16) {
      fs.writeFileSync(path.join(publicDir, "favicon-16x16.png"), finalIcon);
    }
  }

  for (const s of [192, 512]) {
    const padding = Math.floor(s * 0.18);
    const logoSize = s - padding * 2;

    const resizedLogo = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    const maskableIcon = await sharp({
      create: {
        width: s,
        height: s,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(iconsDir, `maskable-icon-${s}x${s}.png`), maskableIcon);
    console.log(`  └─ Saved maskable-icon-${s}x${s}.png`);
  }

  const logo512Buf = fs.readFileSync(path.join(publicDir, "icon-512.png"));
  const base64Png = logo512Buf.toString("base64");
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="100" fill="#0f172a"/>
  <image href="data:image/png;base64,${base64Png}" width="512" height="512"/>
</svg>`;

  fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent);
  console.log(`  └─ Saved favicon.svg`);

  console.log("✅ All icon assets generated successfully!");
}

generateIcons().catch((err) => {
  console.error("❌ Icon Generation Failed:", err);
  process.exit(1);
});
