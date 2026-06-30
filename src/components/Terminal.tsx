import { useEffect, useRef, useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { useMode } from '../lib/mode'
import { PROFILE } from '../lib/data'

type Line = { kind: 'in' | 'out' | 'sys' | 'err' | 'accent'; text: string }

const BANNER: Line[] = [
  { kind: 'accent', text: '┌─ rishit.dhote :: realtime systems shell ─────────────┐' },
  { kind: 'sys', text: "  Type 'help' to list commands. Try: skills · alpharooms · contact" },
  { kind: 'accent', text: '└──────────────────────────────────────────────────────┘' },
]

const HELP: Line[] = [
  { kind: 'out', text: 'AVAILABLE COMMANDS' },
  { kind: 'out', text: '  help        show this list' },
  { kind: 'out', text: '  whoami      who is rishit' },
  { kind: 'out', text: '  skills      core technical stack' },
  { kind: 'out', text: '  alpharooms  jump to the live demo' },
  { kind: 'out', text: '  lab         open the node vs rust throughput lab' },
  { kind: 'out', text: '  experience  career log' },
  { kind: 'out', text: '  contact     open a secure channel' },
  { kind: 'out', text: '  social      github / linkedin' },
  { kind: 'out', text: '  mode        toggle terminal / showcase ui' },
  { kind: 'out', text: '  clear       wipe the screen' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Terminal() {
  const { toggle } = useMode()
  const [history, setHistory] = useState<Line[]>(BANNER)
  const [value, setValue] = useState('')
  const [cmdLog, setCmdLog] = useState<string[]>([])
  const [logIdx, setLogIdx] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [history])

  const push = (lines: Line[]) => setHistory((h) => [...h, ...lines])

  function run(raw: string) {
    const cmd = raw.trim().toLowerCase()
    push([{ kind: 'in', text: `${PROFILE.handle}@portfolio:~$ ${raw}` }])
    if (!cmd) return

    setCmdLog((l) => [raw, ...l])
    setLogIdx(-1)

    switch (cmd) {
      case 'help':
      case 'h':
      case '?':
        push(HELP)
        break
      case 'whoami':
        push([
          { kind: 'accent', text: PROFILE.name },
          { kind: 'out', text: PROFILE.role },
          { kind: 'out', text: PROFILE.tagline },
          { kind: 'sys', text: '↳ Apeing Labs · ex-NSE · B.Tech CS (Blockchain), VIT Vellore · GPA 8.11' },
        ])
        break
      case 'skills':
      case 'stack':
        push([
          { kind: 'accent', text: 'LANG  ' },
          { kind: 'out', text: '  Rust · TypeScript · Python · Solidity · SQL' },
          { kind: 'accent', text: 'FE    ' },
          { kind: 'out', text: '  React · Next.js · Canvas · Tailwind' },
          { kind: 'accent', text: 'BE    ' },
          { kind: 'out', text: '  Tokio · WebSockets · gRPC · Redis · Postgres · AWS' },
          { kind: 'accent', text: 'OPS   ' },
          { kind: 'out', text: '  K6 · Playwright · Grafana' },
          { kind: 'sys', text: "↳ run 'lab' to watch the Rust vs Node engine race" },
        ])
        setTimeout(() => scrollTo('skills'), 350)
        break
      case 'alpharooms':
      case 'projects':
      case 'demo':
        push([
          { kind: 'accent', text: 'Alpharooms — realtime SocialFi trading rooms' },
          { kind: 'out', text: 'live video (AWS IVS) · WebRTC voice · chat · polls · trading terminal' },
          { kind: 'sys', text: '↳ scrolling to the live interactive demo…' },
        ])
        setTimeout(() => scrollTo('alpharooms'), 350)
        break
      case 'lab':
      case 'benchmark':
        push([{ kind: 'sys', text: '↳ opening throughput lab: node.js vs rust…' }])
        setTimeout(() => scrollTo('lab'), 350)
        break
      case 'experience':
      case 'work':
      case 'log':
        push([{ kind: 'sys', text: '↳ printing career log…' }])
        setTimeout(() => scrollTo('work'), 350)
        break
      case 'contact':
      case 'hire':
        push([
          { kind: 'accent', text: 'Opening secure channel…' },
          { kind: 'out', text: `${PROFILE.email} · +91 ${PROFILE.phone}` },
        ])
        setTimeout(() => scrollTo('contact'), 350)
        break
      case 'social':
      case 'links':
        push([
          { kind: 'out', text: `github   → ${PROFILE.githubUrl}` },
          { kind: 'out', text: `linkedin → ${PROFILE.linkedinUrl}` },
        ])
        break
      case 'mode':
      case 'theme':
        toggle()
        push([{ kind: 'sys', text: '↳ interface mode toggled.' }])
        break
      case 'clear':
      case 'cls':
        setHistory([])
        break
      case 'ls':
        push([{ kind: 'out', text: 'alpharooms/  throughput-lab/  stack/  ecosystems/  work.log  contact.sh' }])
        break
      case 'sudo':
        push([{ kind: 'err', text: "nice try. you're not in the sudoers file. this incident will be reported. 🫡" }])
        break
      case 'gm':
        push([{ kind: 'accent', text: 'gm ☀️ — let’s ship something fast.' }])
        break
      default:
        push([{ kind: 'err', text: `command not found: ${cmd}  —  type 'help'` }])
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdLog.length) {
        const next = Math.min(logIdx + 1, cmdLog.length - 1)
        setLogIdx(next)
        setValue(cmdLog[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = logIdx - 1
      if (next < 0) {
        setLogIdx(-1)
        setValue('')
      } else {
        setLogIdx(next)
        setValue(cmdLog[next])
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    }
  }

  const color: Record<Line['kind'], string> = {
    in: 'text-zinc-300',
    out: 'text-zinc-400',
    sys: 'text-zinc-500',
    err: 'text-rose-400',
    accent: 'text-accent',
  }

  return (
    <div
      className="corner-frame panel flex h-[340px] flex-col text-[12.5px] leading-relaxed shadow-2xl shadow-black/60 sm:text-[13px]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel-2)] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-2 truncate text-[11px] text-zinc-500">— rishit@portfolio: ~/shell — zsh</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-600">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" /> attached
        </span>
      </div>

      {/* body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3">
        <div className="mb-1 text-zinc-600">
          <TypeAnimation
            sequence={['booting rishit-os…', 500, 'booting rishit-os… mainnet linked ✓', 800]}
            speed={75}
            cursor={false}
            wrapper="span"
            preRenderFirstString
          />
        </div>
        {history.map((l, i) => (
          <div key={i} className={`whitespace-pre-wrap break-words ${color[l.kind]}`}>
            {l.text}
          </div>
        ))}

        {/* prompt */}
        <div className="mt-1 flex items-center gap-2">
          <span className="shrink-0 text-accent">{PROFILE.handle}@portfolio:~$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="terminal input"
            className="min-w-0 flex-1 bg-transparent text-zinc-200 caret-transparent outline-none placeholder:text-zinc-700"
            placeholder="type a command…"
          />
          <span className="pointer-events-none -ml-2 inline-block h-4 w-2 cursor-blink bg-accent" />
        </div>
      </div>

      {/* hint footer */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--line)] bg-[var(--panel-2)] px-3 py-2 text-[10.5px] text-zinc-600">
        {['help', 'skills', 'alpharooms', 'lab', 'contact', 'clear'].map((c) => (
          <button
            key={c}
            onClick={(e) => {
              e.stopPropagation()
              run(c)
            }}
            className="border border-[var(--line)] px-1.5 py-0.5 text-zinc-500 transition-colors hover:border-accent hover:text-accent"
          >
            {c}
          </button>
        ))}
        <span className="ml-auto hidden sm:inline">↑/↓ history · ⌃L clear</span>
      </div>
    </div>
  )
}
