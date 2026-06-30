import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { toast } from 'sonner'
import {
  Radio,
  Gauge,
  Globe2,
  Boxes,
  GitCommitHorizontal,
  Mail,
  Github,
  Linkedin,
  TerminalSquare,
  ArrowUp,
  SunMoon,
  Phone,
} from 'lucide-react'
import { useMode } from '../lib/mode'
import { PROFILE } from '../lib/data'

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const { toggle, mode } = useMode()

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

        <Command.Group heading="Navigate">
          <Item icon={ArrowUp} label="Top / Hero" onSelect={() => run(() => window.scrollTo({ top: 0, behavior: 'smooth' }))} />
          <Item icon={Radio} label="Alpharooms — live demo" kbd="01" onSelect={() => run(() => go('alpharooms'))} />
          <Item icon={Gauge} label="Throughput Lab — Node vs Rust" kbd="02" onSelect={() => run(() => go('lab'))} />
          <Item icon={Boxes} label="Stack & Selected Work" kbd="03" onSelect={() => run(() => go('skills'))} />
          <Item icon={GitCommitHorizontal} label="Career Log" kbd="04" onSelect={() => run(() => go('work'))} />
          <Item icon={Globe2} label="Live Signal — globe & guestbook" kbd="05" onSelect={() => run(() => go('live'))} />
          <Item icon={Github} label="Build Log — live GitHub" kbd="06" onSelect={() => run(() => go('github'))} />
          <Item icon={Mail} label="Contact" kbd="07" onSelect={() => run(() => go('contact'))} />
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
