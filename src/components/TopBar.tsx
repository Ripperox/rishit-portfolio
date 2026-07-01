import { useEffect, useState } from 'react'
import NumberFlow from '@number-flow/react'
import {
  TerminalSquare,
  Radio,
  Gauge,
  FolderGit2,
  Globe2,
  Mail,
  Github,
  Linkedin,
  Command,
  Boxes,
  Activity,
} from 'lucide-react'
import { useView, type View } from '../lib/view'
import { useMode } from '../lib/mode'
import { PROFILE } from '../lib/data'
import Ticker from './Ticker'

export const NAV: { id: View; label: string; short: string; icon: any; hint: string }[] = [
  { id: 'home', label: 'Home', short: 'Home', icon: TerminalSquare, hint: 'command center' },
  { id: 'work', label: 'Stack & Work', short: 'Work', icon: FolderGit2, hint: 'skills · projects' },
  { id: 'alpharooms', label: 'Alpharooms', short: 'Alpharooms', icon: Radio, hint: 'live demo' },
  { id: 'lab', label: 'Throughput Lab', short: 'Lab', icon: Gauge, hint: 'node vs rust' },
  { id: 'live', label: 'Live Signal', short: 'Live', icon: Globe2, hint: 'globe · guestbook' },
  { id: 'contact', label: 'Contact', short: 'Contact', icon: Mail, hint: 'open a channel' },
]

export default function TopBar() {
  const { view, setView } = useView()
  const { toggle } = useMode()
  const [ping, setPing] = useState(11)

  useEffect(() => {
    const t = setInterval(() => setPing(8 + Math.floor(Math.random() * 9)), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="z-30 hidden shrink-0 flex-col border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md lg:flex">
      <div className="flex h-14 items-center gap-3 px-5">
        {/* brand */}
        <button onClick={() => setView('home')} className="group flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center border border-accent text-accent glow-accent">
            <span className="font-display text-base font-bold leading-none">R</span>
          </span>
          <span className="font-display text-sm font-semibold tracking-wide text-zinc-100 group-hover:text-accent">
            rishit<span className="text-accent">.</span>dhote
          </span>
        </button>

        {/* tabs */}
        <nav className="ml-3 flex items-center gap-0.5">
          {NAV.map((n) => {
            const active = view === n.id
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                title={n.hint}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? 'border-accent text-accent'
                    : 'border-transparent text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <n.icon className={`h-4 w-4 ${active ? 'text-accent' : 'text-zinc-500'}`} />
                {n.short}
              </button>
            )
          })}
        </nav>

        {/* right controls */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[11px] text-zinc-400 xl:flex">
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span className="tabular-nums text-accent">
              <NumberFlow value={ping} suffix="ms" />
            </span>
          </span>
          <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-8 w-8 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent">
            <Github className="h-4 w-4" />
          </a>
          <a href={PROFILE.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-8 w-8 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent">
            <Linkedin className="h-4 w-4" />
          </a>
          <button
            onClick={toggle}
            aria-label="Switch interface mode"
            title="Switch interface mode"
            className="grid h-8 w-8 place-items-center border border-accent text-accent transition-all hover:glow-accent"
          >
            <Boxes className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-cmdk'))}
            aria-label="Open command palette"
            title="Command palette"
            className="flex h-8 items-center gap-1.5 border border-[var(--line)] bg-[var(--panel-2)] px-2.5 text-[12px] text-zinc-400 transition-colors hover:border-accent hover:text-accent"
          >
            <Command className="h-3.5 w-3.5" /> <kbd className="text-[10px]">⌘K</kbd>
          </button>
        </div>
      </div>

      <Ticker />
    </header>
  )
}
