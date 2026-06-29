import { useEffect, useRef, useState } from 'react'
import { Cpu, Database, Gauge, Rabbit, Layers3, AlertTriangle } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { Reveal } from '../lib/motion'

/* ============================================================
   Node.js vs Rust — interactive throughput simulator.

   Drag the offered-load slider and toggle the workload type;
   two simulated engines diverge in real time. The model is a
   simple M/M/1-style queue with per-engine capacity + base
   latency, plus a per-core CPU meter so you can literally watch
   Node pin a single core while Rust fans out across all of them.
   ============================================================ */

const CORES = 8

type Workload = 'io' | 'cpu'

interface Engine {
  key: 'node' | 'rust'
  name: string
  runtime: Record<Workload, string>
  color: string
  cap: Record<Workload, number> // req/s capacity
  base: Record<Workload, number> // base latency ms
}

const ENGINES: Engine[] = [
  {
    key: 'node',
    name: 'Node.js',
    runtime: { io: 'single event loop · libuv pool', cpu: 'single-threaded · 1 core pinned' },
    color: '#8CC84B',
    cap: { io: 9000, cpu: 1100 },
    base: { io: 4, cpu: 9 },
  },
  {
    key: 'rust',
    name: 'Rust',
    runtime: { io: 'Tokio · multi-threaded reactor', cpu: `Tokio · ${CORES} worker threads` },
    color: '#F74C00',
    cap: { io: 16000, cpu: 8600 },
    base: { io: 1.5, cpu: 2.5 },
  },
]

interface Metrics {
  u: number
  served: number
  dropPct: number
  p99: number
  p50: number
}

function metricsFor(load: number, cap: number, base: number): Metrics {
  const u = load / cap
  const served = Math.min(load, cap)
  const dropPct = load > 0 ? (Math.max(0, load - cap) / load) * 100 : 0
  const eff = Math.min(u, 0.985)
  const queue = u < 1 ? eff / (1 - eff) : 60
  let p99 = base * (1 + queue * 1.8)
  let p50 = base * (1 + queue * 0.6)
  p99 = Math.min(p99, 5200)
  p50 = Math.min(p50, 2600)
  return { u, served, dropPct, p99, p50 }
}

function coreLoads(engine: Engine, wl: Workload, u: number): number[] {
  const out: number[] = []
  if (engine.key === 'node') {
    if (wl === 'cpu') {
      // one core pinned, the rest idle
      out.push(Math.min(100, u * 100))
      for (let i = 1; i < CORES; i++) out.push(3 + ((i * 5) % 4))
    } else {
      // event loop core hot + a few libuv threads
      out.push(Math.min(96, u * 80))
      for (let i = 1; i < CORES; i++) out.push(i <= 4 ? Math.min(58, u * 26) : 3)
    }
  } else {
    // rust spreads evenly across all worker threads
    const spread = Math.min(100, u * 100)
    for (let i = 0; i < CORES; i++) out.push(Math.max(2, spread - ((i * 3) % 7)))
  }
  return out
}

const PRESETS = [
  { label: '1k', v: 1000 },
  { label: '2.5k', v: 2500 },
  { label: '5k', v: 5000 },
  { label: '8k', v: 8000 },
]

export default function ThroughputLab() {
  const [load, setLoad] = useState(2500)
  const [wl, setWl] = useState<Workload>('cpu')

  const loadRef = useRef(load)
  const wlRef = useRef(wl)
  loadRef.current = load
  wlRef.current = wl

  // live, jittered metrics + rolling p99 history per engine
  const [live, setLive] = useState<Record<string, Metrics>>({})
  const [hist, setHist] = useState<Record<string, number[]>>({ node: [], rust: [] })

  useEffect(() => {
    const tick = () => {
      const L = loadRef.current
      const w = wlRef.current
      const nextLive: Record<string, Metrics> = {}
      ENGINES.forEach((e) => {
        const m = metricsFor(L, e.cap[w], e.base[w])
        // add a little realtime jitter to latency for life
        const jitter = 1 + (Math.random() - 0.5) * 0.12
        nextLive[e.key] = { ...m, p99: m.p99 * jitter }
      })
      setLive(nextLive)
      setHist((h) => ({
        node: [...h.node.slice(-59), nextLive.node.p99],
        rust: [...h.rust.slice(-59), nextLive.rust.p99],
      }))
    }
    tick()
    const t = setInterval(tick, 240)
    return () => clearInterval(t)
  }, [])

  const node = live.node
  const rust = live.rust

  return (
    <Reveal as="section" id="lab" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeader index="02" command="bench --node --rust" title="Throughput Lab">
        Same workload, two runtimes. Drag the offered load and flip between an <span className="text-zinc-200">I/O-bound</span>{' '}
        and a <span className="text-zinc-200">CPU-bound</span> job — then watch Node's single thread fall off a cliff while
        Rust's Tokio runtime fans the work across every core. This is the exact tradeoff behind the Alpharooms backend.
      </SectionHeader>

      {/* CONTROL DECK */}
      <div className="corner-frame panel mb-4 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        {/* workload toggle */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">workload</span>
          <div className="flex border border-[var(--line)] text-[12px]">
            <button
              onClick={() => setWl('io')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                wl === 'io' ? 'bg-accent text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" /> I/O-bound
            </button>
            <button
              onClick={() => setWl('cpu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                wl === 'cpu' ? 'bg-accent text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" /> CPU-bound
            </button>
          </div>
        </div>

        {/* load slider */}
        <div className="flex-1">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">offered load</span>
            <span className="font-display text-lg font-semibold tabular-nums text-zinc-100">
              {load.toLocaleString()} <span className="text-[11px] font-normal text-zinc-500">req/s</span>
            </span>
          </div>
          <input
            type="range"
            min={200}
            max={8000}
            step={100}
            value={load}
            onChange={(e) => setLoad(+e.target.value)}
            className="w-full"
            aria-label="offered load"
          />
          <div className="mt-2 flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setLoad(p.v)}
                className={`border px-2 py-0.5 text-[11px] tabular-nums transition-colors ${
                  load === p.v ? 'border-accent text-accent' : 'border-[var(--line)] text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* hint */}
        <div className="hidden max-w-[180px] items-start gap-2 border-l border-[var(--line)] pl-4 text-[11px] leading-snug text-zinc-500 lg:flex">
          <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {wl === 'cpu'
            ? 'CPU-bound: hashing / parsing. Node blocks one core; Rust scales to all 8.'
            : 'I/O-bound: db + network waits. Both do well — Rust just keeps p99 flatter.'}
        </div>
      </div>

      {/* ENGINE CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        {ENGINES.map((e) => (
          <EngineCard
            key={e.key}
            engine={e}
            wl={wl}
            metrics={live[e.key]}
            history={hist[e.key]}
          />
        ))}
      </div>

      {/* VERDICT */}
      {node && rust && (
        <Verdict load={load} wl={wl} node={node} rust={rust} />
      )}
    </Reveal>
  )
}

/* ---------------- Engine card ---------------- */
function EngineCard({
  engine,
  wl,
  metrics,
  history,
}: {
  engine: Engine
  wl: Workload
  metrics?: Metrics
  history?: number[]
}) {
  if (!metrics) return <div className="panel h-64" />
  const saturated = metrics.u >= 1
  const heat =
    metrics.u < 0.7 ? engine.color : metrics.u < 1 ? 'var(--amber)' : 'var(--red)'
  const cores = coreLoads(engine, wl, metrics.u)
  // flow speed: faster pipe = higher throughput (lower duration)
  const dur = Math.max(0.35, 2.4 - (metrics.served / engine.cap[wl]) * 2.0)

  return (
    <div
      className="corner-frame panel overflow-hidden"
      style={{ borderColor: saturated ? 'color-mix(in srgb, var(--red) 50%, var(--line))' : 'var(--line)' }}
    >
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: engine.color, boxShadow: `0 0 10px ${engine.color}` }} />
        <span className="font-display text-base font-semibold text-zinc-100">{engine.name}</span>
        <span className="text-[11px] text-zinc-500">{engine.runtime[wl]}</span>
        {saturated && (
          <span className="ml-auto flex items-center gap-1 border border-rose-500/50 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
            <AlertTriangle className="h-3 w-3" /> SATURATED
          </span>
        )}
      </div>

      <div className="p-4">
        {/* flowing pipe */}
        <div className="relative mb-4 h-3 w-full overflow-hidden border border-[var(--line)] bg-[var(--panel-2)]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${heat} 0 8px, transparent 8px 18px)`,
              backgroundSize: '18px 100%',
              opacity: 0.85,
              animation: `pipeflow ${dur}s linear infinite`,
            }}
          />
          {saturated && (
            <div className="absolute inset-0 flex items-center justify-end pr-1.5">
              <span className="bg-[var(--red)] px-1.5 text-[8px] font-bold text-black">DROPPING</span>
            </div>
          )}
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="served" value={Math.round(metrics.served).toLocaleString()} unit="req/s" color={engine.color} icon={Gauge} />
          <Stat
            label="p99 latency"
            value={metrics.p99 >= 1000 ? (metrics.p99 / 1000).toFixed(2) + 's' : Math.round(metrics.p99) + ''}
            unit={metrics.p99 >= 1000 ? '' : 'ms'}
            color={heat}
            icon={Rabbit}
          />
          <Stat
            label="dropped"
            value={metrics.dropPct.toFixed(metrics.dropPct >= 10 ? 0 : 1)}
            unit="%"
            color={metrics.dropPct > 1 ? 'var(--red)' : 'var(--muted)'}
            icon={AlertTriangle}
          />
        </div>

        {/* core meter */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-500">
            <span>cpu cores</span>
            <span className="tabular-nums">{cores.filter((c) => c > 60).length}/{CORES} hot</span>
          </div>
          <div className="flex h-12 items-end gap-1">
            {cores.map((c, i) => (
              <div key={i} className="relative flex flex-1 flex-col justify-end" title={`core ${i}: ${Math.round(c)}%`}>
                <div className="h-full w-full bg-[var(--panel-2)]">
                  <div
                    className="absolute bottom-0 w-full transition-all duration-300"
                    style={{
                      height: `${c}%`,
                      background: c > 85 ? 'var(--red)' : c > 55 ? 'var(--amber)' : engine.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* p99 sparkline */}
        <div className="mt-4">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">p99 over time</div>
          <Sparkline data={history ?? []} color={engine.color} />
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  unit: string
  color: string
  icon: any
}) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel-2)] px-2.5 py-2">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums leading-none" style={{ color }}>
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-zinc-500">{unit}</span>
      </div>
    </div>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 100
  const H = 34
  if (data.length < 2) return <div className="h-[34px] border border-[var(--line)] bg-[var(--panel-2)]" />
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const span = Math.max(max - min, 1)
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W
      const y = H - 3 - ((v - min) / span) * (H - 6)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <div className="border border-[var(--line)] bg-[var(--panel-2)]">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[34px] w-full">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

/* ---------------- Verdict ---------------- */
function Verdict({
  load,
  wl,
  node,
  rust,
}: {
  load: number
  wl: Workload
  node: Metrics
  rust: Metrics
}) {
  const speedup = rust.p99 > 0 ? node.p99 / rust.p99 : 1
  const wlLabel = wl === 'cpu' ? 'CPU-bound' : 'I/O-bound'
  return (
    <div className="corner-frame mt-4 flex flex-col gap-3 border border-[var(--line)] bg-[var(--panel-2)] p-4 sm:flex-row sm:items-center">
      <span className="shrink-0 border border-accent px-2 py-1 text-[10px] font-semibold tracking-wide text-accent">
        VERDICT
      </span>
      <p className="text-[13px] leading-relaxed text-zinc-300">
        At <span className="tabular-nums text-zinc-100">{load.toLocaleString()}</span> req/s {wlLabel}:{' '}
        <span style={{ color: '#F74C00' }}>Rust</span> serves{' '}
        <span className="tabular-nums text-zinc-100">{Math.round(rust.served).toLocaleString()}</span> req/s @{' '}
        <span className="tabular-nums text-zinc-100">{Math.round(rust.p99)}ms</span> p99
        {rust.dropPct < 0.5 ? ' with zero drops' : `, ${rust.dropPct.toFixed(0)}% dropped`}.{' '}
        <span style={{ color: '#8CC84B' }}>Node</span> does{' '}
        <span className="tabular-nums text-zinc-100">{Math.round(node.served).toLocaleString()}</span> req/s
        {node.dropPct > 1 ? (
          <>
            {' '}— <span className="text-rose-400">{node.dropPct.toFixed(0)}% dropped, saturated</span>.
          </>
        ) : (
          <> @ <span className="tabular-nums text-zinc-100">{Math.round(node.p99)}ms</span> p99.</>
        )}{' '}
        {speedup > 1.4 && (
          <span className="text-accent">≈{speedup.toFixed(1)}× lower tail latency on Rust.</span>
        )}
      </p>
    </div>
  )
}
