import { useEffect, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { ArrowDownRight, Cpu, Radio, Zap, MapPin } from 'lucide-react'
import Terminal from './Terminal'
import { m } from '../lib/motion'
import { useView } from '../lib/view'
import { PROFILE } from '../lib/data'

function useTick(initial: number, min: number, max: number, step: number, ms = 1500) {
  const [v, setV] = useState(initial)
  useEffect(() => {
    const t = setInterval(() => {
      setV((prev) => {
        const delta = (Math.random() - 0.5) * 2 * step
        return Math.min(max, Math.max(min, prev + delta))
      })
    }, ms)
    return () => clearInterval(t)
  }, [])
  return v
}

const EASE = [0.22, 1, 0.36, 1] as const
const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
})

const TITLE_WORDS = ['RISHIT', 'DHOTE']

export default function Hero() {
  const conns = useTick(1024, 980, 1180, 22)
  const tput = useTick(38, 32, 44, 1.6)
  const ping = useTick(12, 8, 18, 2)

  const { setView } = useView()

  const stats = [
    {
      icon: Radio,
      label: 'concurrent conns',
      sub: '/replica',
      node: <NumberFlow value={Math.round(conns)} className="font-display text-lg font-semibold text-zinc-100" />,
    },
    {
      icon: Zap,
      label: 'throughput',
      sub: 'msg/s',
      node: (
        <NumberFlow
          value={+tput.toFixed(1)}
          format={{ maximumFractionDigits: 1 }}
          suffix="k"
          className="font-display text-lg font-semibold text-zinc-100"
        />
      ),
    },
    {
      icon: Cpu,
      label: 'p99 latency',
      sub: 'fanout',
      node: (
        <NumberFlow
          value={Math.round(ping)}
          suffix="ms"
          className="font-display text-lg font-semibold text-zinc-100"
        />
      ),
    },
  ]

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="grid items-center gap-8 grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — identity */}
        <div>
          <m.div {...fade(0.05)} className="flex items-center gap-2 text-[11px] tracking-[0.25em] text-zinc-500">
            <span className="h-px w-8 bg-accent" />
            <span>SOFTWARE ENGINEER</span>
            <span className="text-zinc-700">//</span>
            <span className="flex items-center gap-1 text-zinc-500">
              <MapPin className="h-3 w-3" /> {PROFILE.location}
            </span>
          </m.div>

          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {(() => {
              let idx = -1
              return TITLE_WORDS.map((word, wi) => (
                <span key={word} className={`block ${wi === 1 ? 'text-accent text-glow' : 'text-zinc-100'}`}>
                  {word.split('').map((ch, ci) => {
                    idx++
                    return (
                      <m.span
                        key={ci}
                        className="inline-block"
                        initial={{ y: '115%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.15 + idx * 0.045 }}
                      >
                        {ch}
                      </m.span>
                    )
                  })}
                </span>
              ))
            })()}
          </h1>

          <m.p {...fade(0.5)} className="mt-5 max-w-md text-[14px] leading-relaxed text-zinc-400">
            I build <span className="text-zinc-200">high-concurrency backends</span> and{' '}
            <span className="text-zinc-200">realtime interfaces</span> — distributed systems that stay fast
            under load, from streaming data pipelines to apps with 1000+ live users.
          </m.p>

          <m.div {...fade(0.6)} className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setView('alpharooms')}
              className="glass-btn group flex items-center gap-2 border border-accent px-4 py-2.5 text-[13px] font-medium text-accent transition-all hover:glow-accent"
            >
              Launch Alpharooms demo
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
            <button
              onClick={() => setView('lab')}
              className="border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              Node vs Rust lab →
            </button>
          </m.div>

          <m.div {...fade(0.7)} className="mt-9 grid grid-cols-3 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="panel-2 corner-frame px-3 py-3">
                <s.icon className="mb-2 h-3.5 w-3.5 text-accent" />
                <div className="tabular-nums">{s.node}</div>
                <div className="mt-0.5 text-[10px] leading-tight text-zinc-500">
                  {s.label}
                  <br />
                  <span className="text-zinc-600">{s.sub}</span>
                </div>
              </div>
            ))}
          </m.div>
        </div>

        {/* RIGHT — interactive terminal */}
        <m.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: EASE }}>
          <Terminal />
          <div className="mt-2 flex items-center justify-between px-1 text-[10.5px] text-zinc-600">
            <span>interactive · type real commands</span>
            <span className="flex items-center gap-1.5">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" /> session live
            </span>
          </div>
        </m.div>
      </div>
    </section>
  )
}
