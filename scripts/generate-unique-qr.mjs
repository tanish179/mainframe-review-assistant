import fs from "fs";
import QRCode from "qrcode";
import sharp from "sharp";
import jsQR from "jsqr";

const TARGET_URL = "https://mainframe-review-assistant.netlify.app";

function isFinderPattern(x, y, size) {
  if (x < 7 && y < 7) return true;
  if (x >= size - 7 && y < 7) return true;
  if (x < 7 && y >= size - 7) return true;
  return false;
}

function buildQRInnerElements(qr, size, moduleSize, padding) {
  const elements = [];
  const badgeModules = 7;
  const centerStart = Math.floor((size - badgeModules) / 2);
  const centerEnd = centerStart + badgeModules;

  // 1. Data modules with smooth rounded squircle geometry
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinderPattern(x, y, size)) continue;
      // Reserve center area for clean badge
      if (x >= centerStart && x < centerEnd && y >= centerStart && y < centerEnd) continue;

      if (qr.modules.get(x, y)) {
        const px = padding + x * moduleSize;
        const py = padding + y * moduleSize;
        elements.push(
          `<rect x="${px + 1}" y="${py + 1}" width="${moduleSize - 2}" height="${moduleSize - 2}" rx="5" fill="#0F172A"/>`
        );
      }
    }
  }

  // 2. High-precision Finder Eyes (Cobalt blue architectural rings)
  const renderEye = (startX, startY) => {
    const px = padding + startX * moduleSize;
    const py = padding + startY * moduleSize;
    const outerDim = 7 * moduleSize;
    const midDim = 5 * moduleSize;
    const innerDim = 3 * moduleSize;

    return `
      <g>
        <!-- Outer Cobalt Ring -->
        <rect x="${px}" y="${py}" width="${outerDim}" height="${outerDim}" rx="14" fill="#0052FF"/>
        <!-- Clean Masking Core -->
        <rect x="${px + moduleSize}" y="${py + moduleSize}" width="${midDim}" height="${midDim}" rx="10" fill="#FFFFFF"/>
        <!-- Inner Center Dot -->
        <rect x="${px + 2 * moduleSize}" y="${py + 2 * moduleSize}" width="${innerDim}" height="${innerDim}" rx="6" fill="#0052FF"/>
      </g>
    `;
  };

  elements.push(renderEye(0, 0));
  elements.push(renderEye(size - 7, 0));
  elements.push(renderEye(0, size - 7));

  // 3. Center Brand Emblem (MF Tech Circuit Badge)
  const bPx = padding + centerStart * moduleSize;
  const bDim = badgeModules * moduleSize;

  elements.push(`
    <g>
      <!-- Base Shield -->
      <rect x="${bPx}" y="${bPx}" width="${bDim}" height="${bDim}" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <rect x="${bPx + 6}" y="${bPx + 6}" width="${bDim - 12}" height="${bDim - 12}" rx="10" fill="#0052FF"/>
      
      <!-- Tech Circuit "M" -->
      <g fill="#FFFFFF" transform="translate(${bPx + bDim / 2 - 22}, ${bPx + bDim / 2 - 18})">
        <path d="M 4 34 V 10 L 22 26 L 40 10 V 34 H 32 V 20 L 22 29 L 12 20 V 34 H 4 Z"/>
        <circle cx="22" cy="5" r="3" fill="#FFFFFF"/>
      </g>
    </g>
  `);

  return elements.join("\n");
}

async function generate() {
  const qr = QRCode.create(TARGET_URL, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const moduleSize = 22;
  const padding = moduleSize * 3; // generous quiet zone
  const totalDim = size * moduleSize + padding * 2;

  const cornerLen = 28;
  const cornerOffset = 18;

  // 1. Standalone Designer QR SVG
  const styledQRSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="${totalDim}" height="${totalDim}">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
  </defs>

  <!-- Clean Ceramic Plate -->
  <rect width="${totalDim}" height="${totalDim}" rx="28" fill="url(#cardGrad)" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Technical Corner Registration Guides -->
  <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
    <path d="M ${cornerOffset} ${cornerOffset + cornerLen} V ${cornerOffset} H ${cornerOffset + cornerLen}"/>
    <path d="M ${totalDim - cornerOffset - cornerLen} ${cornerOffset} H ${totalDim - cornerOffset} V ${cornerOffset + cornerLen}"/>
    <path d="M ${cornerOffset} ${totalDim - cornerOffset - cornerLen} V ${totalDim - cornerOffset} H ${cornerOffset + cornerLen}"/>
    <path d="M ${totalDim - cornerOffset - cornerLen} ${totalDim - cornerOffset} H ${totalDim - cornerOffset} V ${totalDim - cornerOffset - cornerLen}"/>
  </g>

  ${buildQRInnerElements(qr, size, moduleSize, padding)}
</svg>
  `.trim();

  fs.writeFileSync("public/mainframe-qr-styled.svg", styledQRSvg);
  const qrPngBuffer = await sharp(Buffer.from(styledQRSvg)).png().toBuffer();
  fs.writeFileSync("public/mainframe-qr-styled.png", qrPngBuffer);

  // Verify scanability with jsQR
  const { data, info } = await sharp(qrPngBuffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  if (!decoded || decoded.data !== TARGET_URL) {
    throw new Error(`QR Verification Failed! Decoded: ${decoded ? decoded.data : "null"}`);
  }
  console.log(`✓ Verified scan: ${decoded.data}`);

  // 2. High-End Acrylic Countertop Standee Poster (1200 x 1750 px)
  const posterWidth = 1200;
  const posterHeight = 1750;
  const qrScale = 0.88;
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
  <rect x="36" y="36" width="${posterWidth - 72}" height="${posterHeight - 72}" rx="28" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.6"/>

  <!-- Top Brand Header -->
  <g transform="translate(80, 130)">
    <rect x="0" y="0" width="230" height="34" rx="17" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
    <text x="115" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" letter-spacing="2" fill="#0052FF" text-anchor="middle">MAINFRAME COMPUTERS</text>
    
    <text x="0" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" letter-spacing="-1.5" fill="#0F172A">How was your service?</text>
    <text x="0" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#64748B">Your honest review helps fellow laptop &amp; PC users in Kolhapur.</text>
  </g>

  <!-- Value Highlights Row -->
  <g transform="translate(80, 330)">
    <rect x="0" y="0" width="280" height="52" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="140" y="33" font-family="sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle">⚡ Under 20 Seconds</text>

    <rect x="300" y="0" width="340" height="52" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="470" y="33" font-family="sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle">★ Google Verified Reviews</text>

    <rect x="660" y="0" width="300" height="52" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="810" y="33" font-family="sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle">🔒 Direct Owner Care</text>
  </g>

  <!-- The QR Plaque Container -->
  <g transform="translate(${qrX}, ${qrY})">
    <rect width="${qrScaledDim}" height="${qrScaledDim}" rx="32" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadowLg)"/>
    
    <g transform="scale(${qrScale})">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M ${cornerOffset} ${cornerOffset + cornerLen} V ${cornerOffset} H ${cornerOffset + cornerLen}"/>
        <path d="M ${totalDim - cornerOffset - cornerLen} ${cornerOffset} H ${totalDim - cornerOffset} V ${cornerOffset + cornerLen}"/>
        <path d="M ${cornerOffset} ${totalDim - cornerOffset - cornerLen} V ${totalDim - cornerOffset} H ${cornerOffset + cornerLen}"/>
        <path d="M ${totalDim - cornerOffset - cornerLen} ${totalDim - cornerOffset} H ${totalDim - cornerOffset} V ${totalDim - cornerOffset - cornerLen}"/>
      </g>
      ${buildQRInnerElements(qr, size, moduleSize, padding)}
    </g>
  </g>

  <!-- Big Call to Action Button Pill -->
  <g transform="translate(600, 1340)" text-anchor="middle">
    <rect x="-260" y="0" width="520" height="68" rx="34" fill="url(#btnGrad)"/>
    <text x="0" y="43" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="1">
      📷 SCAN WITH ANY PHONE CAMERA
    </text>
  </g>

  <!-- Footer Info -->
  <g transform="translate(600, 1490)" text-anchor="middle">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#0F172A">
      MainFrame Computers
    </text>
    <text x="0" y="38" font-family="sans-serif" font-size="20" font-weight="500" fill="#64748B">
      Rajarampuri, Kolhapur • Sales, Repairs, SSD &amp; RAM Upgrades
    </text>
    <text x="0" y="74" font-family="monospace" font-size="17" font-weight="600" fill="#0052FF">
      https://mainframe-review-assistant.netlify.app
    </text>
  </g>
</svg>
  `.trim();

  fs.writeFileSync("public/mainframe-standee-card.svg", standeeSvg);
  const standeePngBuffer = await sharp(Buffer.from(standeeSvg)).png().toFile("public/mainframe-standee-card.png");

  // Copy to brain artifacts directory
  const artifactDir = "/home/tanish/.gemini/antigravity-cli/brain/c4b00acb-9a76-494b-8a90-866178a87ada";
  fs.copyFileSync("public/mainframe-qr-styled.png", `${artifactDir}/mainframe-qr-styled.png`);
  fs.copyFileSync("public/mainframe-standee-card.png", `${artifactDir}/mainframe-standee-card.png`);
  console.log("✓ All assets created and verified in public/ and artifacts!");
}

generate().catch(console.error);
