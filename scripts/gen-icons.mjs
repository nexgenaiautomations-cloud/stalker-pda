import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// --- minimal PNG encoder (RGBA, no filtering beyond per-row filter 0) ---
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
    raw[o++] = 0 // filter: none
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = drawPixel(x, y, w, h)
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a
    }
  }
  const idat = deflateSync(raw)

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// --- draw amber-on-black PDA tile with frame and corner brackets ---
function draw(size) {
  const BG = [21, 19, 14, 255]
  const FRAME = [255, 177, 59, 255]
  const FRAME_DIM = [165, 117, 42, 255]
  const ACCENT = [255, 213, 107, 255]
  const margin = Math.round(size * 0.10)
  const inner = margin + Math.round(size * 0.03)

  return (x, y) => {
    // background
    let c = BG
    // outer rounded-ish frame
    const inFrameBox = x >= margin && x <= size - margin - 1 && y >= margin && y <= size - margin - 1
    const isFrameLine =
      (x === margin || x === size - margin - 1 || y === margin || y === size - margin - 1) && inFrameBox
    if (isFrameLine) c = FRAME

    // inner thin line
    const inInnerBox = x >= inner && x <= size - inner - 1 && y >= inner && y <= size - inner - 1
    const isInnerLine =
      (x === inner || x === size - inner - 1 || y === inner || y === size - inner - 1) && inInnerBox
    if (isInnerLine) c = FRAME_DIM

    // corner brackets
    const bracket = Math.round(size * 0.08)
    const off = Math.round(size * 0.05)
    const tlx = off, tly = off
    const trx = size - off - 1, try_ = off
    const blx = off, bly = size - off - 1
    const brx = size - off - 1, bry = size - off - 1
    const isCornerH =
      ((y === tly && x >= tlx && x <= tlx + bracket) ||
       (y === try_ && x <= trx && x >= trx - bracket) ||
       (y === bly && x >= blx && x <= blx + bracket) ||
       (y === bry && x <= brx && x >= brx - bracket))
    const isCornerV =
      ((x === tlx && y >= tly && y <= tly + bracket) ||
       (x === trx && y >= try_ && y <= try_ + bracket) ||
       (x === blx && y <= bly && y >= bly - bracket) ||
       (x === brx && y <= bry && y >= bry - bracket))
    if (isCornerH || isCornerV) c = ACCENT

    // central "PDA" mark — three vertical bars (stencil-like)
    const cx = size / 2, cy = size / 2
    const barW = Math.max(2, Math.round(size * 0.04))
    const barH = Math.round(size * 0.22)
    const gap = Math.round(size * 0.07)
    const positions = [-1, 0, 1]
    for (const p of positions) {
      const bx = Math.round(cx + p * gap - barW / 2)
      const by = Math.round(cy - barH / 2)
      if (x >= bx && x < bx + barW && y >= by && y < by + barH) c = ACCENT
    }
    // baseline
    const bly2 = Math.round(cy + barH / 2 + Math.round(size * 0.04))
    if (y === bly2 && x >= Math.round(cx - gap * 1.4) && x <= Math.round(cx + gap * 1.4)) c = FRAME

    return c
  }
}

for (const size of [192, 512]) {
  const buf = makePNG(size, size, draw(size))
  const p = resolve(outDir, `icon-${size}.png`)
  writeFileSync(p, buf)
  console.log('wrote', p, buf.length, 'bytes')
}
