/* ============================================================
   Static content — single source of truth for the portfolio
   ============================================================ */

export const PROFILE = {
  name: 'Rishit Dhote',
  handle: 'rishit',
  role: 'Systems & Realtime Engineer',
  tagline: 'I build high-concurrency Rust backends and slick realtime trading interfaces.',
  email: 'rishitrdhote@gmail.com',
  phone: '7021796024',
  github: 'Ripperox',
  githubUrl: 'https://github.com/Ripperox',
  linkedin: 'Rishit Dhote',
  linkedinUrl: 'https://www.linkedin.com/in/rishit-dhote',
  location: 'Remote · India',
}

export interface SkillNode {
  name: string
  level: number // 0..100
  blurb: string
}

export const SKILL_GROUPS: { key: string; label: string; accent: string; items: SkillNode[] }[] = [
  {
    key: 'lang',
    label: 'Languages',
    accent: 'var(--accent)',
    items: [
      { name: 'Rust', level: 92, blurb: 'Tokio async, SQLx, zero-cost abstractions, high-concurrency services.' },
      { name: 'TypeScript', level: 94, blurb: 'Strict generics, discriminated unions, end-to-end type safety.' },
      { name: 'Python', level: 82, blurb: 'Data pipelines, EDA over billions of order records, ML tooling.' },
      { name: 'Solidity', level: 78, blurb: 'Smart contracts, on-chain voting (DApp), Sepolia deployments.' },
      { name: 'SQL', level: 88, blurb: 'Postgres + ClickHouse, query planning, OHLCV aggregation.' },
    ],
  },
  {
    key: 'fe',
    label: 'Frontend',
    accent: 'var(--cyan)',
    items: [
      { name: 'React', level: 93, blurb: 'Realtime UIs, canvas, virtualized streams, suspenseful state.' },
      { name: 'Next.js', level: 90, blurb: 'App Router, RSC, edge rendering, Web3 wallet flows.' },
      { name: 'Canvas / WebGL', level: 80, blurb: 'Live charts, stream overlays, 60fps data viz.' },
      { name: 'Tailwind', level: 91, blurb: 'Design systems, token-driven theming, dense terminals.' },
    ],
  },
  {
    key: 'be',
    label: 'Backend',
    accent: 'var(--purple)',
    items: [
      { name: 'Tokio', level: 90, blurb: 'Multi-threaded async runtime, structured concurrency.' },
      { name: 'WebSockets', level: 92, blurb: '1000+ concurrent users/replica, shared Redis fanout.' },
      { name: 'gRPC', level: 84, blurb: 'Tonic services, Yellowstone gRPC ingest from Solana.' },
      { name: 'Redis', level: 86, blurb: 'Pub/sub fanout, sub-second price updates, caching.' },
      { name: 'PostgreSQL', level: 88, blurb: 'SQLx compile-checked queries, PgBouncer pooling.' },
      { name: 'AWS', level: 80, blurb: 'IVS live video, deploy & infra for realtime workloads.' },
    ],
  },
  {
    key: 'test',
    label: 'Testing & Ops',
    accent: 'var(--amber)',
    items: [
      { name: 'K6', level: 85, blurb: 'Load/stress tests; surfaced 89% → 99% at 1000 concurrent users.' },
      { name: 'Playwright', level: 83, blurb: 'E2E across room join, trading terminal, live chat/polls.' },
      { name: 'Grafana', level: 80, blurb: 'Throughput dashboards, latency histograms, alerting.' },
    ],
  },
]

export interface ChainTool {
  label: string
  hot?: boolean
}

export const ECOSYSTEMS: {
  key: string
  name: string
  ticker: string
  color: string
  level: number
  desc: string
  tools: ChainTool[]
  stats: { label: string; value: string }[]
}[] = [
  {
    key: 'solana',
    name: 'Solana',
    ticker: 'SOL',
    color: '#14F195',
    level: 94,
    desc: 'High-velocity ingest & execution. Yellowstone gRPC streams from mainnet, parsed in Rust.',
    tools: [
      { label: 'pump.fun bonding curves', hot: true },
      { label: 'Raydium AMM swaps', hot: true },
      { label: 'Custom SPL token generator', hot: true },
      { label: 'Yellowstone gRPC ingest' },
      { label: 'OHLCV aggregation' },
      { label: 'Turnkey wallets' },
    ],
    stats: [
      { label: 'block ingest', value: '~400ms' },
      { label: 'price fanout', value: '<1s' },
      { label: 'parsers', value: 'Rust' },
    ],
  },
  {
    key: 'tron',
    name: 'TRON',
    ticker: 'TRX',
    color: '#FF0013',
    level: 86,
    desc: 'TRC-20 tooling & contract interaction. Token minting, transfers, and on-chain reads at scale.',
    tools: [
      { label: 'TRC-20 token generator', hot: true },
      { label: 'Smart contract calls', hot: true },
      { label: 'Energy / bandwidth tuning' },
      { label: 'Event log indexing' },
      { label: 'Multi-sig flows' },
      { label: 'TronGrid APIs' },
    ],
    stats: [
      { label: 'finality', value: '~3s' },
      { label: 'fee model', value: 'energy' },
      { label: 'standard', value: 'TRC-20' },
    ],
  },
]

export interface Job {
  role: string
  company: string
  period: string
  location: string
  tag: string
  points: string[]
}

export const EXPERIENCE: Job[] = [
  {
    role: 'Software Developer',
    company: 'Apeing Labs',
    period: '2025.11 — present',
    location: 'Remote',
    tag: 'realtime',
    points: [
      'Shipped a cross-platform Prediction Market module integrating Polymarket & Kalshi via dFlow APIs and custom middleware — aggregating liquidity and syncing multi-chain odds in real time.',
      'Ran load/stress tests with Grafana K6, simulating concurrent users to surface throughput bottlenecks; results drove a refactor raising init-payload delivery from 89% → 99% at 1000 concurrent users/replica.',
      'Owned the test suite — unit, integration, and Playwright E2E across critical flows (room join, trading terminal, live chat/polls) — catching regressions before release.',
    ],
  },
  {
    role: 'Blockchain Developer',
    company: 'Caerulean Bytechains',
    period: '2025.04 — 2025.11',
    location: 'Hyderabad',
    tag: 'rust',
    points: [
      'Built core backend for a SaaS platform letting Web2 developers compose blockchains through a drag-and-drop, plug-and-play feature builder — abstracting Substrate/Polkadot complexity into reusable modules.',
      'Designed and implemented custom consensus mechanisms in Rust/Substrate, building scalable, interoperable chain infrastructure.',
    ],
  },
  {
    role: 'Data Engineer Intern',
    company: 'National Stock Exchange',
    period: '2025.01 — 2025.03',
    location: 'Mumbai',
    tag: 'data',
    points: [
      'Migrated large-scale order data from Greenplum to Cloudera and ran EDA on billions of order records to surface trading trends.',
    ],
  },
  {
    role: 'AI Engineer Intern — LLMs',
    company: 'Smartavya Analytica',
    period: '2024.06 — 2024.07',
    location: 'Pune',
    tag: 'ai',
    points: [
      'Developed a locally-deployed, open-source AI solution for the National Stock Exchange (NSE) to ensure data privacy while enabling users to query databases.',
    ],
  },
]

/* ---- Alpharooms live-demo mock data ---- */
export const CHAT_AUTHORS = [
  { name: 'degen_maxi', color: '#2BFF88' },
  { name: 'rektORrich', color: '#22D3EE' },
  { name: 'liquidity_llama', color: '#A855F7' },
  { name: 'apechad', color: '#F5B14C' },
  { name: 'jeet_no_more', color: '#FF5470' },
  { name: 'onchain_owl', color: '#7DD3FC' },
  { name: 'gigabrain', color: '#34D399' },
  { name: 'sol_sniper', color: '#F472B6' },
]

export const CHAT_LINES = [
  'aped 2 SOL into the new launch 🚀',
  'chart looks bullish af',
  'who else in the voice room rn',
  'GM degens ☀️',
  'that bonding curve is cooking',
  'p99 latency on this feed is insane, sub-second',
  'mods can we get a poll going',
  'TRON gas so cheap lol',
  'raydium pool just got seeded',
  'someone explain the SQLx backend pls',
  'overlay is buttery smooth 🧈',
  'voice quality > twitter spaces',
  'just minted a token in 30s 😭',
  'this is straight up a trading terminal',
  'wen moon ser',
  'stop loss saved me fr',
  'the order flow viz goes hard',
  'redis fanout is doing numbers',
  'ngl best alpha room on the internet',
  'streamer about to call the next 10x',
]

export const VOICE_USERS = [
  { name: 'rishit.sol', role: 'host', color: '#2BFF88' },
  { name: 'mod_mara', role: 'mod', color: '#22D3EE' },
  { name: '0xviper', role: 'speaker', color: '#A855F7' },
  { name: 'tape_reader', role: 'speaker', color: '#F5B14C' },
  { name: 'quietwhale', role: 'listener', color: '#71717A' },
]

export const ARCH_LAYERS = [
  {
    layer: 'Client',
    tech: 'React · TS · Canvas',
    detail: 'Live overlay, virtualized chat, voice UI. 60fps render loop.',
    color: 'var(--cyan)',
  },
  {
    layer: 'Edge',
    tech: 'WebSocket Gateway',
    detail: 'Single multiplexed socket per room — 30+ event types.',
    color: 'var(--accent)',
  },
  {
    layer: 'Service',
    tech: 'Rust · Tokio · Axum',
    detail: 'High-concurrency fanout, 1000+ users/replica, PgBouncer pooling.',
    color: 'var(--purple)',
  },
  {
    layer: 'Bus',
    tech: 'Redis pub/sub',
    detail: 'Shared fanout across replicas, sub-second price propagation.',
    color: 'var(--red)',
  },
  {
    layer: 'Store',
    tech: 'SQLx · PostgreSQL',
    detail: 'Compile-checked queries. Type-safe persistence, zero ORM magic.',
    color: 'var(--amber)',
  },
]
