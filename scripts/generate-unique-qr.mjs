import fs from "fs";
import QRCode from "qrcode";
import sharp from "sharp";

const URL = "https://mainframecomputers.netlify.app/";

function isFinderPattern(x, y, size) {
  // Top-Left (7x7)
  if (x < 7 && y < 7) return true;
  // Top-Right (7x7)
  if (x >= size - 7 && y < 7) return true;
  // Bottom-Left (7x7)
  if (x < 7 && y >= size - 7) return true;
  return false;
}

function isCenterArea(x, y, size) {
  // Reserve 9x9 modules in the center for the brand badge
  const centerStart = Math.floor(size / 2) - 4;
  const centerEnd = Math.floor(size / 2) + 4;
  return x >= centerStart && x <= centerEnd && y >= centerStart && y <= centerEnd;
}

function buildQRInnerElements(size, moduleSize, padding) {
  const qr = QRCode.create(URL, { errorCorrectionLevel: "H" });
  let elements = [];

  // Data modules
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinderPattern(x, y, size)) continue;
      if (isCenterArea(x, y, size)) continue;

      if (qr.modules.get(x, y)) {
        const px = padding + x * moduleSize;
        const py = padding + y * moduleSize;
        // Rounded module (squircle effect)
        elements.push(
          `<rect x="${px + 1.5}" y="${py + 1.5}" width="${moduleSize - 3}" height="${moduleSize - 3}" rx="4" fill="#0F172A"/>`
        );
      }
    }
  }

  // Finder eyes helper
  const renderEye = (startX, startY) => {
    const px = padding + startX * moduleSize;
    const py = padding + startY * moduleSize;
    const eyeSize = 7 * moduleSize;
    const innerSize = 3 * moduleSize;
    const innerOffset = 2 * moduleSize;

    return `
      <g>
        <!-- Outer Cobalt Ring -->
        <rect x="${px}" y="${py}" width="${eyeSize}" height="${eyeSize}" rx="18" fill="none" stroke="#0052FF" stroke-width="10"/>
        <!-- Inner Mask -->
        <rect x="${px + 10}" y="${py + 10}" width="${eyeSize - 20}" height="${eyeSize - 20}" rx="11" fill="#FFFFFF"/>
        <!-- Solid Center Dot -->
        <rect x="${px + innerOffset}" y="${py + innerOffset}" width="${innerSize}" height="${innerSize}" rx="8" fill="#0052FF"/>
      </g>
    `;
  };

  elements.push(renderEye(0, 0)); // Top-Left
  elements.push(renderEye(size - 7, 0)); // Top-Right
  elements.push(renderEye(0, size - 7)); // Bottom-Left

  // Center Emblem
  const centerPixels = 9 * moduleSize;
  const centerStartX = padding + Math.floor((size - 9) / 2) * moduleSize;
  const centerStartY = padding + Math.floor((size - 9) / 2) * moduleSize;

  elements.push(`
    <g transform="translate(${centerStartX}, ${centerStartY})">
      <!-- White Quiet Zone Circle -->
      <rect x="-4" y="-4" width="${centerPixels + 8}" height="${centerPixels + 8}" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <!-- Inner Electric Blue Badge -->
      <rect x="8" y="8" width="${centerPixels - 16}" height="${centerPixels - 16}" rx="18" fill="#0052FF"/>
      
      <!-- Tech Circuit "M" Logo -->
      <g fill="#FFFFFF" transform="translate(${centerPixels / 2 - 28}, ${centerPixels / 2 - 24})">
        <path d="M 6 42 V 12 L 28 32 L 50 12 V 42 H 40 V 26 L 28 37 L 16 26 V 42 H 6 Z"/>
        <circle cx="28" cy="6" r="3.5" fill="#FFFFFF"/>
      </g>
    </g>
  `);

  return elements.join("\n");
}

async function run() {
  const qr = QRCode.create(URL, { errorCorrectionLevel: "H" });
  const size = qr.modules.size; // 37
  const moduleSize = 22;
  const padding = 66;
  const totalDim = size * moduleSize + padding * 2; // 37 * 22 + 132 = 946

  // 1. STANDALONE STYLED QR CODE
  const cornerLen = 30;
  const cornerOffset = 24;
  const w = totalDim;
  const h = totalDim;

  const styledQRSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
  </defs>

  <!-- Clean Base Surface -->
  <rect width="${w}" height="${h}" rx="32" fill="url(#cardBg)" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Technical Corner Registration Brackets -->
  <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
    <path d="M ${cornerOffset} ${cornerOffset + cornerLen} V ${cornerOffset} H ${cornerOffset + cornerLen}"/>
    <path d="M ${w - cornerOffset - cornerLen} ${cornerOffset} H ${w - cornerOffset} V ${cornerOffset + cornerLen}"/>
    <path d="M ${cornerOffset} ${h - cornerOffset - cornerLen} V ${h - cornerOffset} H ${cornerOffset + cornerLen}"/>
    <path d="M ${w - cornerOffset - cornerLen} ${h - cornerOffset} H ${w - cornerOffset} V ${h - cornerOffset - cornerLen}"/>
  </g>

  <!-- QR Modules & Eyes -->
  ${buildQRInnerElements(size, moduleSize, padding)}
</svg>
  `.trim();

  fs.writeFileSync("public/mainframe-qr-styled.svg", styledQRSvg);
  await sharp(Buffer.from(styledQRSvg)).png().toFile("public/mainframe-qr-styled.png");
  console.log("✓ Created public/mainframe-qr-styled.svg & .png (946x946)");

  // 2. LUXURY A5 ACRYLIC STANDEE POSTER
  const posterWidth = 1200;
  const posterHeight = 1750;
  const qrScale = 0.85; // Scale QR to fit cleanly in poster card
  const qrScaledDim = totalDim * qrScale;
  const qrX = (posterWidth - qrScaledDim) / 2;
  const qrY = 460;

  const standeeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${posterWidth} ${posterHeight}" width="${posterWidth}" height="${posterHeight}">
  <defs>
    <linearGradient id="posterBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0052FF"/>
      <stop offset="100%" stop-color="#0035A8"/>
    </linearGradient>
    <filter id="shadowLg" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Acrylic Plaque Outline -->
  <rect width="${posterWidth}" height="${posterHeight}" rx="40" fill="url(#posterBg)" stroke="#E2E8F0" stroke-width="3"/>

  <!-- Architectural Frame Edge -->
  <rect x="36" y="36" width="${posterWidth - 72}" height="${posterHeight - 72}" rx="28" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.6"/>

  <!-- Top Brand Header -->
  <g transform="translate(80, 130)">
    <!-- Small Category Eyebrow -->
    <rect x="0" y="0" width="220" height="34" rx="17" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
    <text x="110" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" letter-spacing="2" fill="#0052FF" text-anchor="middle">MAINFRAME COMPUTERS</text>
    
    <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" letter-spacing="-1.5" fill="#0F172A">How was your service?</text>
    <text x="0" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#64748B">Your honest review helps fellow laptop &amp; PC users in Kolhapur.</text>
  </g>

  <!-- Trust Badges Row -->
  <g transform="translate(80, 330)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="280" height="52" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="140" y="33" font-family="sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle">⚡ Under 20 Seconds</text>

    <!-- Badge 2 -->
    <rect x="300" y="0" width="340" height="52" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="470" y="33" font-family="sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle">★ Google Verified Reviews</text>

    <!-- Badge 3 -->
    <rect x="660" y="0" width="300" height="52" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="810" y="33" font-family="sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle">🔒 Direct Owner Care</text>
  </g>

  <!-- The High-End QR Card Frame with Drop Shadow -->
  <g transform="translate(${qrX}, ${qrY})">
    <rect width="${qrScaledDim}" height="${qrScaledDim}" rx="32" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadowLg)"/>
    
    <!-- Inlined Scaled QR elements -->
    <g transform="scale(${qrScale})">
      <!-- Technical Corner Registration Brackets -->
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M ${cornerOffset} ${cornerOffset + cornerLen} V ${cornerOffset} H ${cornerOffset + cornerLen}"/>
        <path d="M ${w - cornerOffset - cornerLen} ${cornerOffset} H ${w - cornerOffset} V ${cornerOffset + cornerLen}"/>
        <path d="M ${cornerOffset} ${h - cornerOffset - cornerLen} V ${h - cornerOffset} H ${cornerOffset + cornerLen}"/>
        <path d="M ${w - cornerOffset - cornerLen} ${h - cornerOffset} H ${w - cornerOffset} V ${h - cornerOffset - cornerLen}"/>
      </g>
      ${buildQRInnerElements(size, moduleSize, padding)}
    </g>
  </g>

  <!-- Big Call to Action Button Pill -->
  <g transform="translate(600, 1340)" text-anchor="middle">
    <rect x="-260" y="0" width="520" height="68" rx="34" fill="url(#btnGrad)"/>
    <text x="0" y="43" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="1">
      📷 SCAN WITH ANY PHONE CAMERA
    </text>
  </g>

  <!-- Footer Branding -->
  <g transform="translate(600, 1490)" text-anchor="middle">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#0F172A">
      MainFrame Computers
    </text>
    <text x="0" y="38" font-family="sans-serif" font-size="20" font-weight="500" fill="#64748B">
      Rajarampuri, Kolhapur • Sales, Repairs, SSD &amp; RAM Upgrades
    </text>
    <text x="0" y="74" font-family="monospace" font-size="17" font-weight="600" fill="#0052FF">
      https://mainframecomputers.netlify.app
    </text>
  </g>
</svg>
  `.trim();

  fs.writeFileSync("public/mainframe-standee-card.svg", standeeSvg);
  await sharp(Buffer.from(standeeSvg)).png().toFile("public/mainframe-standee-card.png");
  console.log("✓ Created public/mainframe-standee-card.svg & .png (1200x1750)");

  // Copy to brain artifacts directory for markdown rendering
  const artifactDir = "/home/tanish/.gemini/antigravity-cli/brain/c4b00acb-9a76-494b-8a90-866178a87ada";
  fs.copyFileSync("public/mainframe-qr-styled.png", `${artifactDir}/mainframe-qr-styled.png`);
  fs.copyFileSync("public/mainframe-standee-card.png", `${artifactDir}/mainframe-standee-card.png`);
  console.log("✓ Copied assets to artifact directory");
}

run();
