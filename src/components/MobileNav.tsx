import { Command, Boxes } from 'lucide-react'
import { useView } from '../lib/view'
import { useMode } from '../lib/mode'
import { NAV } from './TopBar'

export function MobileTopBar() {
  const { setView } = useView()
  const { toggle } = useMode()
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-3 overflow-x-clip border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] px-3 backdrop-blur-md lg:hidden">
      <button onClick={() => setView('home')} aria-label="Home" className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center border border-accent text-accent glow-accent">
          <span className="font-display text-sm font-bold leading-none">R</span>
        </span>
        <span className="font-display text-sm font-semibold tracking-wide text-zinc-200">
          rishit<span className="text-accent">.</span>dhote
        </span>
      </button>
      <button
        onClick={() => window.dispatchEvent(new Event('toggle-cmdk'))}
        aria-label="Open command palette"
        className="ml-auto grid h-9 w-9 place-items-center border border-[var(--line)] bg-[var(--panel-2)] text-zinc-400 transition-colors hover:border-accent hover:text-accent"
      >
        <Command className="h-4 w-4" />
      </button>
      <button
        onClick={toggle}
        aria-label="Switch interface mode"
        className="grid h-9 w-9 place-items-center border border-accent text-accent transition-all hover:glow-accent"
      >
        <Boxes className="h-4 w-4" />
      </button>
    </header>
  )
}

export function MobileBottomNav() {
  const { view, setView } = useView()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md lg:hidden">
      {NAV.map((n) => {
        const active = view === n.id
        return (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            aria-label={n.label}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 border-t-2 text-[9px] transition-colors ${
              active ? 'border-accent text-accent' : 'border-transparent text-zinc-500'
            }`}
          >
            <n.icon className="h-[18px] w-[18px]" />
            <span className="leading-none">{n.short}</span>
          </button>
        )
      })}
    </nav>
  )
}
