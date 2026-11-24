const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);
  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function encodeRGBAtoPNG(width, height, rgbaBuffer) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let src = 0;
  let dst = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dst++] = 0; // Filter None
    for (let x = 0; x < width * 4; x++) {
      scanlines[dst++] = rgbaBuffer[src++];
    }
  }

  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  return Buffer.concat([
    header,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", idatData),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

function makeICO(pngImages) {
  const count = pngImages.length;
  const headerLen = 6;
  const dirEntryLen = 16;
  const dirLen = headerLen + count * dirEntryLen;

  let currentOffset = dirLen;
  const dirEntries = [];

  for (const img of pngImages) {
    const entry = Buffer.alloc(dirEntryLen);
    entry[0] = img.width >= 256 ? 0 : img.width;
    entry[1] = img.height >= 256 ? 0 : img.height;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }

  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  return Buffer.concat([
    header,
    ...dirEntries,
    ...pngImages.map((img) => img.buffer),
  ]);
}

function getRGB512() {
  const logoPath = path.join(__dirname, "..", "public", "logo.png");
  const buf = fs.readFileSync(logoPath);
  let offset = 8;
  let idatBuffers = [];
  let width, height;

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    if (type === "IHDR") {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
    } else if (type === "IDAT") {
      idatBuffers.push(buf.slice(offset + 8, offset + 8 + length));
    }
    offset += 12 + length;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
  const bpp = 3;
  const raw = Buffer.alloc(width * height * bpp);
  let srcPos = 0;
  let dstPos = 0;

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcPos++];
    for (let x = 0; x < width * bpp; x++) {
      const val = decompressed[srcPos++];
      let prev = 0;
      if (filterType === 1) prev = x >= bpp ? raw[dstPos - bpp] : 0;
      else if (filterType === 2) prev = y > 0 ? raw[dstPos - width * bpp] : 0;
      else if (filterType === 3) {
        const a = x >= bpp ? raw[dstPos - bpp] : 0;
        const b = y > 0 ? raw[dstPos - width * bpp] : 0;
        prev = Math.floor((a + b) / 2);
      } else if (filterType === 4) {
        const a = x >= bpp ? raw[dstPos - bpp] : 0;
        const b = y > 0 ? raw[dstPos - width * bpp] : 0;
        const c = x >= bpp && y > 0 ? raw[dstPos - width * bpp - bpp] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        if (pa <= pb && pa <= pc) prev = a;
        else if (pb <= pc) prev = b;
        else prev = c;
      }
      raw[dstPos++] = (val + prev) & 0xff;
    }
  }
  return { width, height, raw };
}

function resizeRGBA(srcWidth, srcHeight, srcBuffer, targetWidth, targetHeight) {
  const dstBuffer = Buffer.alloc(targetWidth * targetHeight * 4);
  const scaleX = srcWidth / targetWidth;
  const scaleY = srcHeight / targetHeight;

  for (let dy = 0; dy < targetHeight; dy++) {
    const syStart = dy * scaleY;
    const syEnd = (dy + 1) * scaleY;

    for (let dx = 0; dx < targetWidth; dx++) {
      const sxStart = dx * scaleX;
      const sxEnd = (dx + 1) * scaleX;

      let rSum = 0,
        gSum = 0,
        bSum = 0,
        aSum = 0,
        weightSum = 0;

      const y0 = Math.floor(syStart);
      const y1 = Math.min(srcHeight - 1, Math.floor(syEnd));
      const x0 = Math.floor(sxStart);
      const x1 = Math.min(srcWidth - 1, Math.floor(sxEnd));

      for (let sy = y0; sy <= y1; sy++) {
        const yWeight = Math.min(sy + 1, syEnd) - Math.max(sy, syStart);
        for (let sx = x0; sx <= x1; sx++) {
          const xWeight = Math.min(sx + 1, sxEnd) - Math.max(sx, sxStart);
          const weight = xWeight * yWeight;

          const idx = (sy * srcWidth + sx) * 4;
          const a = srcBuffer[idx + 3] / 255;
          rSum += srcBuffer[idx] * a * weight;
          gSum += srcBuffer[idx + 1] * a * weight;
          bSum += srcBuffer[idx + 2] * a * weight;
          aSum += srcBuffer[idx + 3] * weight;
          weightSum += weight;
        }
      }

      const dstIdx = (dy * targetWidth + dx) * 4;
      const finalA = Math.round(aSum / weightSum);
      if (finalA > 0) {
        const norm = aSum / 255;
        dstBuffer[dstIdx] = Math.max(0, Math.min(255, Math.round(rSum / norm)));
        dstBuffer[dstIdx + 1] = Math.max(
          0,
          Math.min(255, Math.round(gSum / norm)),
        );
        dstBuffer[dstIdx + 2] = Math.max(
          0,
          Math.min(255, Math.round(bSum / norm)),
        );
        dstBuffer[dstIdx + 3] = finalA;
      } else {
        dstBuffer[dstIdx] = 0;
        dstBuffer[dstIdx + 1] = 0;
        dstBuffer[dstIdx + 2] = 0;
        dstBuffer[dstIdx + 3] = 0;
      }
    }
  }
  return dstBuffer;
}

const { width, height, raw } = getRGB512();

// Create 512x512 RGBA with clean anti-aliased circular mask
const rgba512 = Buffer.alloc(512 * 512 * 4);
const cx = 255.5;
const cy = 255.5;
const R = 254.5;

for (let y = 0; y < 512; y++) {
  for (let x = 0; x < 512; x++) {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const srcIdx = (y * 512 + x) * 3;
    const dstIdx = (y * 512 + x) * 4;

    let r = raw[srcIdx];
    let g = raw[srcIdx + 1];
    let b = raw[srcIdx + 2];
    let a = 255;

    if (dist > R + 1.2) {
      a = 0;
      r = 0;
      g = 0;
      b = 0;
    } else if (dist > R - 1.2) {
      const t = (R + 1.2 - dist) / 2.4;
      a = Math.max(0, Math.min(255, Math.round(t * 255)));
      r = 66;
      g = 66;
      b = 66; // Outer charcoal rim
    }

    rgba512[dstIdx] = r;
    rgba512[dstIdx + 1] = g;
    rgba512[dstIdx + 2] = b;
    rgba512[dstIdx + 3] = a;
  }
}

// Generate all target sizes
const sizes = [16, 32, 48, 64, 180, 192, 512];
const generated = {};
for (const s of sizes) {
  if (s === 512) {
    generated[s] = encodeRGBAtoPNG(512, 512, rgba512);
  } else {
    const resized = resizeRGBA(512, 512, rgba512, s, s);
    generated[s] = encodeRGBAtoPNG(s, s, resized);
  }
}

const pubDir = path.join(__dirname, "..", "public");

// Write favicon.png (64x64)
fs.writeFileSync(path.join(pubDir, "favicon.png"), generated[64]);
console.log("Saved public/favicon.png (64x64):", generated[64].length, "bytes");

// Write favicon-32.png (32x32)
fs.writeFileSync(path.join(pubDir, "favicon-32.png"), generated[32]);
console.log(
  "Saved public/favicon-32.png (32x32):",
  generated[32].length,
  "bytes",
);

// Write favicon.ico (16, 32, 48, 64)
const icoBuf = makeICO([
  { width: 16, height: 16, buffer: generated[16] },
  { width: 32, height: 32, buffer: generated[32] },
  { width: 48, height: 48, buffer: generated[48] },
  { width: 64, height: 64, buffer: generated[64] },
]);
fs.writeFileSync(path.join(pubDir, "favicon.ico"), icoBuf);
console.log("Saved public/favicon.ico:", icoBuf.length, "bytes");

// Write apple-touch-icon.png (180x180)
fs.writeFileSync(path.join(pubDir, "apple-touch-icon.png"), generated[180]);
console.log(
  "Saved public/apple-touch-icon.png:",
  generated[180].length,
  "bytes",
);

// Write icon-192.png and icon-512.png
fs.writeFileSync(path.join(pubDir, "icon-192.png"), generated[192]);
console.log("Saved public/icon-192.png:", generated[192].length, "bytes");

fs.writeFileSync(path.join(pubDir, "icon-512.png"), generated[512]);
console.log("Saved public/icon-512.png:", generated[512].length, "bytes");

// Write SVG favicon
const base64Png512 = generated[512].toString("base64");
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="circle-clip">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,${base64Png512}" width="512" height="512" clip-path="url(#circle-clip)" />
</svg>
`;
fs.writeFileSync(path.join(pubDir, "favicon.svg"), svgContent.trim());
console.log("Saved public/favicon.svg");
