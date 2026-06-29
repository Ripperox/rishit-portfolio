import sharp from 'sharp'

const W = 1200
const H = 630
const ACCENT = '#00ff9d'
const RED = '#ef4444'
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// faint background grid
let grid = ''
for (let x = 0; x <= W; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>`
for (let y = 0; y <= H; y += 40) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>`

// ---- right-side "Alpharooms" candlestick panel ----
const PX = 700, PY = 96, PW = 448, PH = 486
const cTop = PY + 78
const cBot = PY + PH - 30
const cH = cBot - cTop
const N = 16
const startX = PX + 28
const slot = 25
const bw = 12
const yOf = (v) => cBot - v * cH

let p = 0.55
const data = []
for (let i = 0; i < N; i++) {
  const o = p
  p = Math.max(0.14, Math.min(0.86, p + Math.sin(i * 0.8) * 0.07 + (((i * 37) % 7) - 3) * 0.02))
  const c = p
  const hi = Math.min(0.96, Math.max(o, c) + 0.04 + ((i * 13) % 5) * 0.006)
  const lo = Math.max(0.04, Math.min(o, c) - 0.04 - ((i * 7) % 5) * 0.006)
  data.push({ o, c, hi, lo })
}
let candles = ''
let linePts = ''
data.forEach((d, i) => {
  const x = startX + i * slot
  const cx = x + bw / 2
  const up = d.c >= d.o
  const col = up ? ACCENT : RED
  const top = yOf(Math.max(d.o, d.c))
  const bot = yOf(Math.min(d.o, d.c))
  candles += `<line x1="${cx}" y1="${yOf(d.hi).toFixed(1)}" x2="${cx}" y2="${yOf(d.lo).toFixed(1)}" stroke="${col}" stroke-width="1.5" opacity="0.85"/>`
  candles += `<rect x="${x}" y="${top.toFixed(1)}" width="${bw}" height="${Math.max(2, bot - top).toFixed(1)}" fill="${col}" opacity="0.9"/>`
  linePts += `${cx},${yOf(d.c).toFixed(1)} `
})
let chartGrid = ''
for (let i = 1; i < 4; i++) chartGrid += `<line x1="${PX + 16}" y1="${cTop + (cH / 4) * i}" x2="${PX + PW - 16}" y2="${cTop + (cH / 4) * i}" stroke="rgba(255,255,255,0.05)"/>`

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="14%" cy="22%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="86%" cy="84%" r="50%">
      <stop offset="0%" stop-color="#3fdfbe" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#3fdfbe" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#09090b"/>
  ${grid}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- frame + corner brackets -->
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <path d="M40 24 H24 V40" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 40} ${H - 24} H${W - 24} V${H - 40}" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.7"/>

  <!-- ===== left column ===== -->
  <circle cx="86" cy="106" r="6" fill="${ACCENT}"/>
  <text x="104" y="113" font-family="${FONT}" font-size="24" fill="${ACCENT}" opacity="0.9" letter-spacing="1">rishit@portfolio:~$ whoami</text>

  <text x="74" y="262" font-family="${FONT}" font-size="98" font-weight="800" letter-spacing="1" fill="#f4f4f5">RISHIT</text>
  <text x="74" y="356" font-family="${FONT}" font-size="98" font-weight="800" letter-spacing="1" fill="${ACCENT}">DHOTE</text>

  <text x="78" y="412" font-family="${FONT}" font-size="31" font-weight="600" fill="#d4d4d8">Backend &amp; Distributed Systems Engineer</text>
  <text x="78" y="452" font-family="${FONT}" font-size="22" fill="#a1a1aa">Realtime Rust · Alpharooms · Node-vs-Rust lab</text>

  <line x1="78" y1="520" x2="640" y2="520" stroke="rgba(255,255,255,0.08)"/>
  <text x="78" y="558" font-family="${FONT}" font-size="22" fill="#71717a" letter-spacing="0.5">Rust · TypeScript · Tokio · WebSockets · Solana</text>
  <circle cx="86" cy="589" r="5" fill="${ACCENT}"/>
  <text x="102" y="596" font-family="${FONT}" font-size="25" font-weight="700" fill="${ACCENT}">rishitdhote.vercel.app</text>

  <!-- ===== right panel: live chart ===== -->
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="#0c0c0e" stroke="rgba(0,255,157,0.25)" stroke-width="1"/>
  <rect x="${PX}" y="${PY}" width="${PW}" height="38" fill="#101014"/>
  <circle cx="${PX + 22}" cy="${PY + 19}" r="5" fill="#ef4444" opacity="0.8"/>
  <circle cx="${PX + 40}" cy="${PY + 19}" r="5" fill="#f5b14c" opacity="0.8"/>
  <circle cx="${PX + 58}" cy="${PY + 19}" r="5" fill="#00ff9d" opacity="0.8"/>
  <text x="${PX + 80}" y="${PY + 24}" font-family="${FONT}" font-size="16" fill="#a1a1aa">alpharooms · $WIF/SOL</text>
  <rect x="${PX + PW - 70}" y="${PY + 10}" width="54" height="20" fill="rgba(239,68,68,0.14)" stroke="#ef4444" stroke-width="1"/>
  <circle cx="${PX + PW - 58}" cy="${PY + 20}" r="3.5" fill="#ef4444"/>
  <text x="${PX + PW - 48}" y="${PY + 24}" font-family="${FONT}" font-size="13" font-weight="700" fill="#ef4444">LIVE</text>

  ${chartGrid}
  ${candles}
  <polyline points="${linePts.trim()}" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.55"/>
  <text x="${PX + 16}" y="${PY + PH - 12}" font-family="${FONT}" font-size="15" fill="#52525b">1000+ concurrent · sub-second fanout</text>
</svg>`

await sharp(Buffer.from(svg), { density: 96 }).png().toFile('public/og.png')
console.log('wrote public/og.png')
