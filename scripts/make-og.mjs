import sharp from 'sharp'

const W = 1200
const H = 630
const ACCENT = '#00ff9d'

// build the dotted-grid lines
let grid = ''
for (let x = 0; x <= W; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>`
for (let y = 0; y <= H; y += 40) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>`

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="18%" cy="22%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="88%" cy="92%" r="50%">
      <stop offset="0%" stop-color="#3fdfbe" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#3fdfbe" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#09090b"/>
  ${grid}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- frame + corner brackets -->
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <path d="M40 24 H24 V40" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 40} ${H - 24} H${W - 24} V${H - 40}" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.7"/>

  <!-- terminal prompt -->
  <circle cx="84" cy="103" r="6" fill="${ACCENT}"/>
  <text x="102" y="110" font-family="${FONT}" font-size="26" fill="${ACCENT}" opacity="0.9" letter-spacing="1">rishit@portfolio:~$ whoami</text>

  <!-- headline -->
  <text x="78" y="285" font-family="${FONT}" font-size="125" font-weight="800" letter-spacing="2">
    <tspan fill="#f4f4f5">RISHIT</tspan><tspan fill="${ACCENT}" dx="40">DHOTE</tspan>
  </text>

  <!-- role -->
  <text x="82" y="350" font-family="${FONT}" font-size="40" font-weight="600" fill="#d4d4d8" letter-spacing="0.5">Backend &amp; Distributed Systems Engineer</text>

  <!-- hook -->
  <text x="82" y="402" font-family="${FONT}" font-size="27" fill="#a1a1aa">Realtime Rust systems · Alpharooms live demo · Node-vs-Rust throughput lab</text>

  <!-- divider -->
  <line x1="82" y1="500" x2="${W - 82}" y2="500" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- footer -->
  <text x="82" y="560" font-family="${FONT}" font-size="26" fill="#71717a" letter-spacing="1">Rust · TypeScript · Tokio · WebSockets · Solana</text>
  <circle cx="${W - 360}" cy="552" r="5" fill="${ACCENT}"/>
  <text x="${W - 82}" y="560" text-anchor="end" font-family="${FONT}" font-size="26" font-weight="700" fill="${ACCENT}">rishitdhote.vercel.app</text>
</svg>`

await sharp(Buffer.from(svg), { density: 96 }).png().toFile('public/og.png')
console.log('wrote public/og.png')
