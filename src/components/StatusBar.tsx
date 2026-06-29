import { useEffect, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Activity, TerminalSquare, Boxes, Github, Linkedin, Command } from 'lucide-react'
import { useMode } from '../lib/mode'
import { PROFILE } from '../lib/data'

const NAV = [
  { id: 'alpharooms', label: 'Alpharooms' },
  { id: 'lab', label: 'Throughput Lab' },
  { id: 'skills', label: 'Stack' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
]

const TICKER = [
  'SOL ◎ 142.30 ▲2.4%',
  'p99 12ms',
  'WS conns 1,024',
  'TRX 0.118 ▲0.9%',
  'fanout <1s',
  'uptime 99.98%',
  'BTC 64,210 ▼0.3%',
  'replicas 4/4 healthy',
  'throughput 38k msg/s',
]

export default function StatusBar() {
  const { mode, toggle } = useMode()
  const [ping, setPing] = useState(11)
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const t = setInterval(() => {
      setPing(8 + Math.floor(Math.random() * 9))
      const d = new Date()
      setClock(d.toTimeString().slice(0, 8))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top control row */}
      <div className="flex h-12 items-center gap-3 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-3 backdrop-blur-md sm:px-5">
        {/* brand */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center border border-accent text-accent glow-accent">
            <span className="font-display text-sm font-bold leading-none">R</span>
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-wide text-zinc-200 group-hover:text-accent sm:block">
            rishit<span className="text-accent">.</span>dhote
          </span>
        </button>

        <span className="hidden items-center gap-1.5 border-l border-[var(--line)] pl-3 text-[11px] text-zinc-500 lg:flex">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          ONLINE
        </span>

        {/* nav */}
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="px-2.5 py-1 text-[12px] tracking-wide text-zinc-400 transition-colors hover:text-accent"
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* command palette trigger */}
        <button
          onClick={() => window.dispatchEvent(new Event('toggle-cmdk'))}
          className="ml-auto flex items-center gap-1.5 border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:border-accent hover:text-accent md:ml-0"
          title="Open command palette"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="hidden tabular-nums sm:inline">⌘K</span>
        </button>

        {/* live ping */}
        <div className="flex items-center gap-1.5 border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[11px] text-zinc-400">
          <Activity className="h-3.5 w-3.5 text-accent" />
          <span className="tabular-nums text-accent"><NumberFlow value={ping} suffix="ms" /></span>
          <span className="hidden text-zinc-600 sm:inline">·</span>
          <span className="hidden tabular-nums text-zinc-500 sm:inline">{clock}</span>
        </div>

        {/* socials */}
        <div className="hidden items-center gap-1 sm:flex">
          <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent" aria-label="GitHub">
            <Github className="h-3.5 w-3.5" />
          </a>
          <a href={PROFILE.linkedinUrl} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent" aria-label="LinkedIn">
            <Linkedin className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* mode toggle */}
        <button
          onClick={toggle}
          className="group flex items-center gap-1.5 border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2.5 py-1 text-[11px] font-medium text-accent transition-all hover:glow-accent"
          title="Switch interface mode"
        >
          {mode === 'terminal' ? <TerminalSquare className="h-3.5 w-3.5" /> : <Boxes className="h-3.5 w-3.5" />}
          <span className="tracking-wide">{mode === 'terminal' ? 'TERMINAL' : 'SHOWCASE'}</span>
        </button>
      </div>

      {/* Ticker row */}
      <div className="relative h-7 overflow-hidden border-b border-[var(--line)] bg-[var(--panel-2)]">
        <div className="marquee-track flex h-full w-max items-center gap-8 whitespace-nowrap pr-8 text-[11px] tabular-nums text-zinc-500">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className={t.includes('▲') ? 'text-emerald-400' : t.includes('▼') ? 'text-rose-400' : 'text-zinc-400'}>
                {t}
              </span>
              <span className="text-zinc-700">/</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
