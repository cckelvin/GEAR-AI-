import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPNG(width, height, colorFn) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const combined = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function gearPixel(x, y, width, height, safePaddingRatio = 0.08) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const maxR = (width / 2) * (1 - safePaddingRatio);
  const gearOuterR = maxR * 0.90;
  const gearToothDepth = maxR * 0.22;
  const gearInnerRimR = maxR * 0.68;
  const holeOuterR = maxR * 0.44;
  const holeInnerR = maxR * 0.26;
  const sparkR = maxR * 0.12;

  const bgNorm = dist / (width * 0.7);
  let bgR = Math.max(10, Math.floor(13 - bgNorm * 5));
  let bgG = Math.max(10, Math.floor(13 - bgNorm * 5));
  let bgB = Math.max(16, Math.floor(20 - bgNorm * 6));

  const teeth = 6;
  const toothWave = Math.cos(angle * teeth);
  const effectiveOuterR = gearInnerRimR + (toothWave > 0 ? (gearOuterR - gearInnerRimR) * Math.min(1, toothWave * 2.2) : 0);

  const inGear = dist <= effectiveOuterR && dist >= holeOuterR;
  const inCenterSpark = dist <= sparkR;
  const inHub = dist <= holeInnerR;

  if (inCenterSpark) {
    const t = dist / sparkR;
    const r = Math.floor(59 + (255 - 59) * (1 - t));
    const g = Math.floor(130 + (255 - 130) * (1 - t));
    const b = 255;
    return [r, g, b, 255];
  }

  if (inHub) {
    return [20, 24, 34, 255];
  }

  if (inGear) {
    const gradientFactor = 0.5 + 0.5 * Math.sin(angle + Math.PI / 4);
    const rimEdge = Math.abs(dist - effectiveOuterR) < (width * 0.015) ? 1 : 0;
    const r = Math.floor(40 + 70 * gradientFactor + rimEdge * 60);
    const g = Math.floor(90 + 90 * gradientFactor + rimEdge * 60);
    const b = Math.floor(200 + 55 * gradientFactor + rimEdge * 55);
    return [r, g, b, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG
const png192 = createPNG(192, 192, (x, y, w, h) => gearPixel(x, y, w, h, 0.08));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 2. 512x512 PNG
const png512 = createPNG(512, 512, (x, y, w, h) => gearPixel(x, y, w, h, 0.08));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 3. 512x512 Maskable PNG (18% safe padding)
const pngMaskable = createPNG(512, 512, (x, y, w, h) => gearPixel(x, y, w, h, 0.20));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// 4. Apple Touch Icon 180x180 PNG
const pngApple = createPNG(180, 180, (x, y, w, h) => gearPixel(x, y, w, h, 0.10));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// 5. Favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

// 6. SVG Icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0A0A0E"/>
  <defs>
    <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="50%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <radialGradient id="sparkGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#93C5FD"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </radialGradient>
  </defs>
  <g transform="translate(256, 256)">
    <path d="M-40,-190 L40,-190 L50,-150 C80,-140 108,-124 132,-102 L170,-115 L210,-45 L180,-18 C185,-1 185,17 180,34 L210,61 L170,131 L132,118 C108,140 80,156 50,166 L40,206 L-40,206 L-50,166 C-80,156 -108,140 -132,118 L-170,131 L-210,61 L-180,34 C-185,17 -185,-1 -180,-18 L-210,-45 L-170,-115 L-132,-102 C-108,-124 -80,-140 -50,-150 Z" fill="url(#gearGrad)" stroke="#93C5FD" stroke-width="6"/>
    <circle r="105" fill="#0A0A0E"/>
    <circle r="60" fill="url(#gearGrad)" opacity="0.8"/>
    <circle r="36" fill="url(#sparkGrad)"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

console.log('Successfully created all PWA icons in public/ !');
