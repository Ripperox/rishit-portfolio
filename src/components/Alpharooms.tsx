import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  Radio,
  Users,
  Send,
  Mic,
  MicOff,
  Crown,
  Shield,
  TrendingUp,
  TrendingDown,
  Layers,
  Play,
  Volume2,
} from 'lucide-react'
import NumberFlow from '@number-flow/react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import SectionHeader from './SectionHeader'
import { useMode } from '../lib/mode'
import { Reveal, m, AnimatePresence } from '../lib/motion'
import { CHAT_AUTHORS, CHAT_LINES, VOICE_USERS, ARCH_LAYERS } from '../lib/data'

// Code-split the TradingView chart (~61kb gz) out of the initial bundle.
const AlpharoomsChart = lazy(() => import('./AlpharoomsChart'))

type Msg = { id: number; author: string; color: string; text: string }

let MID = 0

export default function Alpharooms() {
  const { mode } = useMode()
  const accentHex = mode === 'terminal' ? '#00ff9d' : '#3fdfbe'

  const [view, setView] = useState<'live' | 'arch'>('live')
  const [viewers, setViewers] = useState(1342)
  const [price, setPrice] = useState(0.0428)
  const [up, setUp] = useState(true)

  /* viewer + price tickers */
  useEffect(() => {
    const t = setInterval(() => {
      setViewers((v) => Math.max(1180, v + Math.round((Math.random() - 0.45) * 40)))
      setPrice((p) => {
        const np = Math.max(0.02, p + (Math.random() - 0.5) * 0.0026)
        setUp(np >= p)
        return np
      })
    }, 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <Reveal as="section" id="alpharooms" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeader index="01" command="alpharooms --live" title="Alpharooms">
        A realtime SocialFi platform — live video (AWS IVS), WebRTC voice, chat, polls, moderation and a
        trading terminal, all multiplexed over a single per-room WebSocket. Below is a{' '}
        <span className="text-zinc-200">working interactive preview</span>.
      </SectionHeader>

      {/* APP WINDOW */}
      <div className="corner-frame overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-2xl shadow-black/60">
        {/* window header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <span className="text-zinc-600">alpharooms.app/</span>
            <span className="text-zinc-200">wif-degen-lounge</span>
          </div>
          <span className="flex items-center gap-1.5 border border-rose-500/50 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-rose-400">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-rose-500" /> LIVE
          </span>
          <span className="flex items-center gap-1.5 text-[12px] tabular-nums text-zinc-400">
            <Users className="h-3.5 w-3.5" /> <NumberFlow value={viewers} />
          </span>

          {/* view toggle */}
          <div className="ml-auto flex border border-[var(--line)] text-[11px]">
            <button
              onClick={() => setView('live')}
              className={`flex items-center gap-1.5 px-3 py-1 transition-colors ${
                view === 'live' ? 'bg-accent text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Play className="h-3 w-3" /> Live
            </button>
            <button
              onClick={() => setView('arch')}
              className={`flex items-center gap-1.5 px-3 py-1 transition-colors ${
                view === 'arch' ? 'bg-accent text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3 w-3" /> Architecture
            </button>
          </div>
        </div>

        {/* body */}
        <div className="grid lg:grid-cols-[1.55fr_1fr]">
          {/* LEFT: stage / arch */}
          <div className="border-b border-[var(--line)] lg:border-b-0 lg:border-r">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
              >
                {view === 'live' ? (
                  <Stage accentHex={accentHex} price={price} up={up} />
                ) : (
                  <ArchView />
                )}
              </m.div>
            </AnimatePresence>
            <VoiceRoom />
          </div>

          {/* RIGHT: chat — absolutely fills its grid cell so it tracks the left
              column height and scrolls internally instead of stretching the window */}
          <div className="relative h-[60vh] lg:h-auto">
            <div className="inset-0 flex h-full flex-col lg:absolute">
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>

      {/* meta strip */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-accent" /> 30+ event types · one socket</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-[var(--purple)]" /> Rust · Tokio · SQLx · Postgres</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-[var(--red)]" /> Redis pub/sub fanout</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-[var(--cyan)]" /> 1000+ concurrent / replica</span>
      </div>
    </Reveal>
  )
}

/* ---------------- Stage (stream + trade overlay) ---------------- */
function Stage({ accentHex, price, up }: { accentHex: string; price: number; up: boolean }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--panel-2)] sm:aspect-[16/9]">
      {/* faux video backdrop */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(80% 60% at 30% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%), radial-gradient(70% 70% at 80% 90%, color-mix(in srgb, var(--purple) 22%, transparent), transparent 60%)',
        }}
      />
      <Suspense fallback={null}>
        <AlpharoomsChart accentHex={accentHex} />
      </Suspense>

      {/* top overlay row */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <div className="flex items-center gap-2 border border-[var(--line)] bg-black/55 px-2.5 py-1 text-[11px] backdrop-blur-sm">
          <Radio className="h-3.5 w-3.5 text-accent" />
          <span className="text-zinc-200">$WIF / SOL</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">Raydium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="border border-[var(--line)] bg-black/55 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur-sm">
            1080p · 60fps
          </span>
          <span className="flex items-center gap-1 border border-rose-500/50 bg-black/55 px-2 py-1 text-[10px] font-semibold text-rose-400 backdrop-blur-sm">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-rose-500" /> REC
          </span>
        </div>
      </div>

      {/* mini orderbook — echoes apeing-fe OrderBook bid/ask gradients */}
      <div className="absolute right-3 top-14 hidden w-[150px] border border-[var(--line)] bg-black/55 backdrop-blur-sm md:block">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-500">
          <span>orderbook</span>
          <span>size</span>
        </div>
        <OrderBook price={price} />
      </div>

      {/* host badge */}
      <div className="absolute bottom-[4.4rem] left-3 flex items-center gap-2 border border-[var(--line)] bg-black/55 px-2.5 py-1.5 backdrop-blur-sm">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[10px] font-bold text-black">RD</span>
        <div className="leading-tight">
          <div className="text-[11px] text-zinc-200">rishit.sol</div>
          <div className="text-[9px] text-zinc-500">streaming the launch</div>
        </div>
      </div>

      {/* trade terminal strip */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-[var(--line)] bg-black/65 px-3 py-2.5 backdrop-blur-md">
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">price</div>
          <div className="flex items-center gap-1.5 font-display text-lg font-semibold tabular-nums text-zinc-100">
            ${price.toFixed(4)}
            {up ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
          </div>
        </div>
        {/* mini depth — apeing buy/sell tint */}
        <div className="hidden flex-1 items-end gap-0.5 sm:flex">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="flex-1"
              style={{
                height: `${10 + ((i * 7 + 13) % 26)}px`,
                background: i < 14 ? 'rgba(10,194,166,0.55)' : 'rgba(239,68,68,0.5)',
                opacity: 0.4 + ((i * 13) % 10) / 18,
              }}
            />
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button
            className="px-3 py-1.5 text-[11px] font-bold text-black transition-colors"
            style={{ background: 'var(--buy)' }}
          >
            BUY
          </button>
          <button
            className="px-3 py-1.5 text-[11px] font-bold text-black transition-colors"
            style={{ background: 'var(--sell)' }}
          >
            SELL
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Mini orderbook (apeing-fe echo) ---------------- */
function OrderBook({ price }: { price: number }) {
  const rows = 4
  const asks = Array.from({ length: rows }, (_, i) => price * (1 + (rows - i) * 0.0009))
  const bids = Array.from({ length: rows }, (_, i) => price * (1 - (i + 1) * 0.0009))
  const sizeFor = (i: number) => 20 + ((i * 37 + 11) % 70)

  return (
    <div className="font-mono text-[10px] tabular-nums">
      {asks.map((p, i) => (
        <div key={`a${i}`} className="relative flex justify-between px-2 py-[1.5px]">
          <div
            className="absolute inset-y-0 right-0"
            style={{
              width: `${sizeFor(i)}%`,
              background: 'linear-gradient(to left, rgba(239,68,68,0.22), rgba(239,68,68,0.05), transparent)',
            }}
          />
          <span className="relative z-10 text-[var(--sell)]">{p.toFixed(4)}</span>
          <span className="relative z-10 text-zinc-400">{(sizeFor(i) * 1.4).toFixed(0)}</span>
        </div>
      ))}
      <div className="flex justify-between border-y border-[var(--line)] bg-black/40 px-2 py-0.5 text-[9px] text-zinc-400">
        <span className="text-[var(--accent)]">{price.toFixed(4)}</span>
        <span className="text-zinc-600">spread 0.1%</span>
      </div>
      {bids.map((p, i) => (
        <div key={`b${i}`} className="relative flex justify-between px-2 py-[1.5px]">
          <div
            className="absolute inset-y-0 right-0"
            style={{
              width: `${sizeFor(i + 2)}%`,
              background: 'linear-gradient(to left, rgba(10,194,166,0.22), rgba(10,194,166,0.05), transparent)',
            }}
          />
          <span className="relative z-10 text-[var(--buy)]">{p.toFixed(4)}</span>
          <span className="relative z-10 text-zinc-400">{(sizeFor(i + 2) * 1.4).toFixed(0)}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Architecture view ---------------- */
function ArchView() {
  return (
    <div className="aspect-[16/10] w-full overflow-y-auto bg-[var(--panel-2)] p-4 sm:aspect-[16/9]">
      <div className="mb-3 flex items-center gap-2 text-[11px] tracking-wide text-zinc-400">
        <Layers className="h-4 w-4 text-accent" /> REQUEST PATH · one event, end to end
      </div>
      <div className="space-y-2">
        {ARCH_LAYERS.map((l, i) => (
          <div key={l.layer}>
            <div
              className="group flex items-center gap-3 border border-[var(--line)] bg-[var(--panel)] p-3 transition-colors hover:border-zinc-600"
              style={{ borderLeft: `2px solid ${l.color}` }}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center text-[10px] font-bold" style={{ color: l.color }}>
                0{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] font-semibold text-zinc-200">{l.layer}</span>
                  <span className="font-mono text-[11px]" style={{ color: l.color }}>
                    {l.tech}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-zinc-500">{l.detail}</div>
              </div>
            </div>
            {i < ARCH_LAYERS.length - 1 && (
              <div className="flex justify-start pl-[1.45rem]">
                <svg width="14" height="14" className="text-zinc-700">
                  <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" className="flow-dash" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 border border-dashed border-[var(--line)] bg-black/30 p-2.5 text-[11px] text-zinc-500">
        <span className="text-accent">SQLx</span> compile-checks every query against the live schema — type-safe
        persistence with <span className="text-zinc-300">zero ORM magic</span>.
      </div>
    </div>
  )
}

/* ---------------- Voice room ---------------- */
function VoiceRoom() {
  const [speaking, setSpeaking] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const t = setInterval(() => {
      const next: Record<string, boolean> = {}
      VOICE_USERS.forEach((u) => {
        if (u.role === 'listener') next[u.name] = false
        else next[u.name] = Math.random() > 0.55
      })
      setSpeaking(next)
    }, 900)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] bg-[var(--panel)] px-3 py-3">
      <span className="flex items-center gap-1.5 pr-1 text-[11px] text-zinc-500">
        <Volume2 className="h-3.5 w-3.5 text-accent" /> voice
      </span>
      {VOICE_USERS.map((u) => {
        const isSpeaking = speaking[u.name]
        const isListener = u.role === 'listener'
        return (
          <div
            key={u.name}
            className="flex items-center gap-2 border bg-[var(--panel-2)] px-2 py-1.5 transition-all"
            style={{ borderColor: isSpeaking ? u.color : 'var(--line)' }}
          >
            <div className="relative">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-black"
                style={{ background: u.color, boxShadow: isSpeaking ? `0 0 0 2px ${u.color}55` : 'none' }}
              >
                {u.name.slice(0, 2).toUpperCase()}
              </span>
              {u.role === 'host' && (
                <Crown className="absolute -right-1 -top-1.5 h-3 w-3" style={{ color: 'var(--amber)' }} />
              )}
              {u.role === 'mod' && (
                <Shield className="absolute -right-1 -top-1.5 h-3 w-3" style={{ color: 'var(--cyan)' }} />
              )}
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-zinc-200">{u.name}</div>
              <div className="flex h-3 items-end gap-[2px]">
                {isListener ? (
                  <MicOff className="h-3 w-3 text-zinc-600" />
                ) : isSpeaking ? (
                  [0, 1, 2, 3].map((b) => (
                    <span
                      key={b}
                      className="voicebar w-[2.5px]"
                      style={{ height: '11px', background: u.color, animationDelay: `${b * 0.12}s` }}
                    />
                  ))
                ) : (
                  <Mic className="h-3 w-3 text-zinc-600" />
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Chat panel ---------------- */
function ChatPanel() {
  const [msgs, setMsgs] = useState<Msg[]>(() =>
    Array.from({ length: 6 }).map(() => randomMsg()),
  )
  const [draft, setDraft] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const [listRef] = useAutoAnimate<HTMLDivElement>({ duration: 220, easing: 'ease-out' })

  useEffect(() => {
    const t = setInterval(
      () => {
        setMsgs((m) => [...m.slice(-39), randomMsg()])
      },
      1100 + Math.random() * 700,
    )
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMsgs((m) => [...m.slice(-39), { id: MID++, author: 'you', color: 'var(--accent)', text }])
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--panel)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2.5 text-[11px]">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" /> live chat
        </span>
        <span className="text-zinc-600">{msgs.length} recent</span>
      </div>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 text-[12px] leading-snug">
        <div ref={listRef} className="space-y-1.5">
          {msgs.map((msg) => (
            <div key={msg.id} className="flex gap-1.5">
              <span className="shrink-0 font-medium" style={{ color: msg.color }}>
                {msg.author}
              </span>
              <span className="text-zinc-300">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--line)] p-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="say something…"
          className="w-full flex-1 bg-[var(--panel-2)] px-2.5 py-2 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          onClick={send}
          className="grid h-9 w-9 shrink-0 place-items-center bg-accent text-black transition-transform hover:scale-105"
          aria-label="send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function randomMsg(): Msg {
  const a = CHAT_AUTHORS[Math.floor(Math.random() * CHAT_AUTHORS.length)]
  const text = CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)]
  return { id: MID++, author: a.name, color: a.color, text }
}
