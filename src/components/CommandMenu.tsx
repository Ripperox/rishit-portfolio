import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { toast } from 'sonner'
import {
  Radio,
  Gauge,
  Globe2,
  Boxes,
  Mail,
  Github,
  Linkedin,
  TerminalSquare,
  SunMoon,
  Phone,
} from 'lucide-react'
import { useMode } from '../lib/mode'
import { useView } from '../lib/view'
import { PROFILE } from '../lib/data'

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const { toggle, mode } = useMode()
  const { setView } = useView()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const openEvt = () => setOpen((o) => !o)
    document.addEventListener('keydown', down)
    window.addEventListener('toggle-cmdk', openEvt)
    return () => {
      document.removeEventListener('keydown', down)
      window.removeEventListener('toggle-cmdk', openEvt)
    }
  }, [])

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-content"
    >
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-3">
        <TerminalSquare className="h-4 w-4 text-accent" />
        <Command.Input placeholder="Type a command or search…" />
        <kbd className="hidden rounded border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-zinc-500 sm:block">ESC</kbd>
      </div>
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Go to view">
          <Item icon={TerminalSquare} label="Home — command center" kbd="01" onSelect={() => run(() => setView('home'))} />
          <Item icon={Radio} label="Alpharooms — live demo" kbd="02" onSelect={() => run(() => setView('alpharooms'))} />
          <Item icon={Gauge} label="Throughput Lab — Node vs Rust" kbd="03" onSelect={() => run(() => setView('lab'))} />
          <Item icon={Boxes} label="Stack & Work — skills, projects, career" kbd="04" onSelect={() => run(() => setView('work'))} />
          <Item icon={Globe2} label="Live Signal — globe, guestbook, GitHub" kbd="05" onSelect={() => run(() => setView('live'))} />
          <Item icon={Mail} label="Contact" kbd="06" onSelect={() => run(() => setView('contact'))} />
        </Command.Group>

        <Command.Group heading="Actions">
          <Item
            icon={SunMoon}
            label={`Switch to ${mode === 'terminal' ? 'Showcase' : 'Terminal'} mode`}
            onSelect={() => run(() => { toggle(); toast(`Interface → ${mode === 'terminal' ? 'showcase' : 'terminal'} mode`) })}
          />
          <Item
            icon={Mail}
            label="Copy email address"
            onSelect={() =>
              run(() => {
                navigator.clipboard?.writeText(PROFILE.email)
                toast.success('Email copied', { description: PROFILE.email })
              })
            }
          />
          <Item
            icon={Phone}
            label="Copy phone number"
            onSelect={() =>
              run(() => {
                navigator.clipboard?.writeText(PROFILE.phone)
                toast.success('Phone copied', { description: `+91 ${PROFILE.phone}` })
              })
            }
          />
        </Command.Group>

        <Command.Group heading="Links">
          <Item icon={Github} label="GitHub" onSelect={() => run(() => window.open(PROFILE.githubUrl, '_blank'))} />
          <Item icon={Linkedin} label="LinkedIn" onSelect={() => run(() => window.open(PROFILE.linkedinUrl, '_blank'))} />
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

function Item({
  icon: Icon,
  label,
  kbd,
  onSelect,
}: {
  icon: any
  label: string
  kbd?: string
  onSelect: () => void
}) {
  return (
    <Command.Item value={label} onSelect={onSelect}>
      <Icon className="h-4 w-4 text-zinc-500" />
      <span className="flex-1">{label}</span>
      {kbd && <span className="text-[10px] tabular-nums text-zinc-600">{kbd}</span>}
    </Command.Item>
  )
}
