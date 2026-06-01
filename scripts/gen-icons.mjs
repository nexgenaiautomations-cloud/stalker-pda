import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// --- minimal PNG encoder (RGBA) ---
function crc32(buf) {
  let c, table = crc32._t
  if (!table) {
    table = crc32._t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      table[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const td = Buffer.concat([t, data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0)
  return Buffer.concat([len, td, crc])
}
function makePNG(w, h, drawPixel) {
  const raw = Buffer.alloc((w * 4 + 1) * h)
  let o = 0
  for (let y = 0; y < h; y++) {
    raw[o++] = 0
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = drawPixel(x, y, w, h)
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a
    }
  }
  const idat = deflateSync(raw)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// --- gas mask draw ---
function draw(size) {
  const BG          = [21, 19, 14, 255]   // pda bg (warm dark)
  const MASK_FILL   = [28, 24, 16, 255]   // mask body interior
  const LENS        = [6, 5, 3, 255]      // goggle lens (near black)
  const FRAME       = [255, 177, 59, 255] // amber outline
  const FRAME_HOT   = [255, 213, 107, 255]// bright amber accents
  const FRAME_DIM   = [165, 117, 42, 255] // dim amber

  // line width in normalized units (~1.5px @ 192, ~4px @ 512)
  const lw = Math.max(1.5 / size, 0.0055)
  // softer line for inner details
  const lwS = Math.max(1.2 / size, 0.0042)

  const inEllipse = (nx, ny, cx, cy, rx, ry) => {
    const dx = (nx - cx) / rx, dy = (ny - cy) / ry
    return dx * dx + dy * dy
  }
  const onEllipseRing = (t, inner = 0.84) => t < 1 && t > inner

  return (x, y) => {
    const nx = (x + 0.5) / size
    const ny = (y + 0.5) / size

    // --- shapes ---
    // Head (top dome of mask)
    const headT = inEllipse(nx, ny, 0.50, 0.42, 0.36, 0.32)
    const inHead = headT < 1
    // Snout rectangle (between cheeks, mid)
    const inSnoutRect = nx > 0.36 && nx < 0.64 && ny > 0.50 && ny < 0.74
    // Snout bottom bulge
    const snoutBT = inEllipse(nx, ny, 0.50, 0.74, 0.16, 0.10)
    const inSnoutBottom = snoutBT < 1
    const inBody = inHead || inSnoutRect || inSnoutBottom

    // Body outline (amber stroke around the union)
    let onBodyOutline = false
    if (inHead && headT > 0.86) onBodyOutline = true
    if (inSnoutBottom && snoutBT > 0.78) onBodyOutline = true
    // Vertical snout edges only where visible (below the head dome)
    const snoutEdgesY = ny > 0.60 && ny < 0.70
    if (snoutEdgesY && (Math.abs(nx - 0.36) < lw || Math.abs(nx - 0.64) < lw)) onBodyOutline = true
    // Outline should be inside the body
    if (onBodyOutline && !inBody) onBodyOutline = false

    // Goggles (two large round lenses)
    const gL = inEllipse(nx, ny, 0.355, 0.395, 0.14, 0.14)
    const gR = inEllipse(nx, ny, 0.645, 0.395, 0.14, 0.14)
    const inGoggleL = gL < 1
    const inGoggleR = gR < 1
    const inGoggle = inGoggleL || inGoggleR
    const onGoggleRing = (inGoggleL && gL > 0.79) || (inGoggleR && gR > 0.79)
    // Bright highlight crescent at the top-left of each lens
    const hlL = inEllipse(nx, ny, 0.325, 0.345, 0.05, 0.025)
    const hlR = inEllipse(nx, ny, 0.615, 0.345, 0.05, 0.025)
    const onHighlight =
      (hlL < 1 && gL < 0.55) ||
      (hlR < 1 && gR < 0.55)

    // Filter cylinder (canister hanging below the snout)
    const fX0 = 0.41, fX1 = 0.59, fY0 = 0.74, fY1 = 0.92
    const inFilter = nx > fX0 && nx < fX1 && ny > fY0 && ny < fY1
    const onFilterEdge = inFilter && (
      Math.abs(nx - fX0) < lw ||
      Math.abs(nx - fX1) < lw ||
      Math.abs(ny - fY0) < lw ||
      Math.abs(ny - fY1) < lw
    )
    // Filter stripes — three horizontal grilles
    const grilles = [0.79, 0.83, 0.87]
    const onFilterGrille = inFilter && grilles.some(t => Math.abs(ny - t) < lwS) && nx > fX0 + 0.015 && nx < fX1 - 0.015

    // Vent slits at the top of the mask (small triangle hints)
    const ventY = ny > 0.20 && ny < 0.24
    const ventL = ventY && nx > 0.45 && nx < 0.48
    const ventR = ventY && nx > 0.52 && nx < 0.55
    const ventM = ventY && nx > 0.485 && nx < 0.515

    // Side straps (amber hints)
    const strapBand = ny > 0.38 && ny < 0.43
    const inStrapL = strapBand && nx < 0.06
    const inStrapR = strapBand && nx > 0.94
    const strapBand2 = ny > 0.50 && ny < 0.55
    const inStrap2L = strapBand2 && nx < 0.05
    const inStrap2R = strapBand2 && nx > 0.95

    // Corner brackets (PDA framing)
    const off = 0.05
    const len = 0.09
    const onBracket =
      // top-left
      (ny >= off && ny <= off + lw && nx >= off && nx <= off + len) ||
      (nx >= off && nx <= off + lw && ny >= off && ny <= off + len) ||
      // top-right
      (ny >= off && ny <= off + lw && nx >= 1 - off - len && nx <= 1 - off) ||
      (nx >= 1 - off - lw && nx <= 1 - off && ny >= off && ny <= off + len) ||
      // bot-left
      (ny >= 1 - off - lw && ny <= 1 - off && nx >= off && nx <= off + len) ||
      (nx >= off && nx <= off + lw && ny >= 1 - off - len && ny <= 1 - off) ||
      // bot-right
      (ny >= 1 - off - lw && ny <= 1 - off && nx >= 1 - off - len && nx <= 1 - off) ||
      (nx >= 1 - off - lw && nx <= 1 - off && ny >= 1 - off - len && ny <= 1 - off)

    // --- paint order ---
    let c = BG
    if (onBracket) c = FRAME_HOT
    if (inBody) c = MASK_FILL
    if (onBodyOutline) c = FRAME
    if (inGoggle) c = LENS
    if (onGoggleRing) c = FRAME
    if (onHighlight) c = FRAME_HOT
    if (inFilter) c = MASK_FILL
    if (onFilterEdge) c = FRAME
    if (onFilterGrille) c = FRAME_DIM
    if (ventL || ventR || ventM) c = FRAME_DIM
    if (inStrapL || inStrapR || inStrap2L || inStrap2R) c = FRAME

    return c
  }
}

for (const size of [192, 512]) {
  const buf = makePNG(size, size, draw(size))
  const p = resolve(outDir, `icon-${size}.png`)
  writeFileSync(p, buf)
  console.log('wrote', p, buf.length, 'bytes')
}
