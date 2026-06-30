import { useEffect, useMemo, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { toast } from 'sonner'
import { Globe2, MessageSquare, Send, MapPin } from 'lucide-react'
import Globe, { type Marker } from './Globe'
import SectionHeader from './SectionHeader'
import { Reveal } from '../lib/motion'
import { useMode } from '../lib/mode'
import { getJSON, timeAgo, flag } from '../lib/api'

type Geo = { lat: number | null; lng: number | null; city?: string | null; country?: string | null }
type Visit = { live: boolean; total: number | null; yourNumber: number | null; recent: Geo[]; you: Geo }
type Msg = { name: string; message: string; city?: string | null; country?: string | null; lat?: number | null; lng?: number | null; t: number }

const COLOR: Record<string, [number, number, number]> = {
  terminal: [0, 1, 0.62],
  showcase: [0.25, 0.87, 0.75],
}

export default function LiveSection() {
  const { mode } = useMode()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [name, setName] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [listRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 })
  const posted = useRef(false)

  useEffect(() => {
    getJSON<Visit>('/api/visit').then((d) => d && setVisit(d))
    getJSON<{ messages: Msg[] }>('/api/guestbook').then((d) => d?.messages && setMessages(d.messages))
  }, [])

  const markers = useMemo<Marker[]>(() => {
    const m: Marker[] = []
    visit?.recent?.forEach((r) => {
      if (r.lat != null && r.lng != null) m.push({ location: [r.lat, r.lng], size: 0.03 })
    })
    messages.forEach((g) => {
      if (g.lat != null && g.lng != null) m.push({ location: [g.lat, g.lng], size: 0.035 })
    })
    if (visit?.you?.lat != null && visit?.you?.lng != null) m.push({ location: [visit.you.lat, visit.you.lng], size: 0.1 })
    return m.slice(0, 80)
  }, [visit, messages])

  const live = !!visit?.live
  const yourCity = visit?.you?.city

  async function send() {
    const message = draft.trim()
    if (!message || sending) return
    setSending(true)
    try {
      const r = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message }),
      })
      const data = await r.json().catch(() => null)
      if (r.ok && data?.messages) {
        setMessages(data.messages)
        setDraft('')
        toast.success('Signed the wall', { description: 'your ping is on the globe' })
      } else {
        toast.error(data?.error || 'could not post right now')
      }
    } catch {
      toast.error('network error')
    } finally {
      setSending(false)
    }
  }

  return (
    <Reveal as="section" id="live" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <SectionHeader index="05" command="ping --global && cat guestbook" title="Live Signal">
        This part is <span className="text-zinc-200">real</span>. The globe pings every visitor's approximate
        location (city-level, no IPs stored), the counter is a real cross-visitor count, and the wall below is a
        live guestbook — leave a mark.
      </SectionHeader>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_1fr]">
        {/* GLOBE + counter */}
        <div className="corner-frame panel flex flex-col items-center justify-center p-5">
          <Globe markers={markers} markerColor={COLOR[mode]} />

          <div className="mt-2 flex items-center gap-2 border border-[var(--line)] bg-[var(--panel-2)] px-3 py-1.5 text-[11px] tracking-wider">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'live-dot bg-accent' : 'bg-zinc-600'}`} />
            <span className={live ? 'text-accent' : 'text-zinc-500'}>
              GLOBAL_PING: {live ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 border border-[var(--line)] bg-[var(--panel-2)] px-4 py-2.5 text-[13px] text-zinc-300">
            <Globe2 className="h-4 w-4 text-accent" />
            {live && visit?.yourNumber ? (
              <span>
                You are visitor{' '}
                <span className="font-display font-semibold text-accent">
                  #<NumberFlow value={visit.yourNumber} />
                </span>
                {yourCity ? <span className="text-zinc-500"> · from {yourCity}</span> : null}
              </span>
            ) : yourCity ? (
              <span>
                Hello, <span className="text-accent">{yourCity}</span> — live counter activating soon
              </span>
            ) : (
              <span className="text-zinc-500">connecting to the global feed…</span>
            )}
          </div>
        </div>

        {/* GUESTBOOK */}
        <div className="corner-frame panel flex flex-col">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 text-[12px]">
            <span className="flex items-center gap-2 text-zinc-300">
              <MessageSquare className="h-4 w-4 text-accent" /> guestbook
            </span>
            <span className="text-zinc-600">{messages.length} signed</span>
          </div>

          <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ maxHeight: 360 }}>
            {messages.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-zinc-600">
                {live ? 'No one has signed yet — be the first. 👋' : 'Guestbook warming up…'}
              </p>
            ) : (
              messages.map((m, i) => (
                <div key={`${m.t}-${i}`} className="border border-[var(--line)] bg-[var(--panel-2)] p-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px]">
                    <span className="font-medium text-accent">{m.name}</span>
                    {m.city && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <MapPin className="h-2.5 w-2.5" /> {flag(m.country)} {m.city}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] tabular-nums text-zinc-600">{timeAgo(m.t)}</span>
                  </div>
                  <p className="mt-1 break-words text-[13px] text-zinc-300">{m.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[var(--line)] p-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              aria-label="your name (optional)"
              placeholder="name (optional)"
              className="mb-2 w-full min-w-0 bg-[var(--panel-2)] px-2.5 py-1.5 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-[var(--accent)]"
            />
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                maxLength={140}
                aria-label="guestbook message"
                placeholder="leave a message for the world…"
                className="min-w-0 flex-1 bg-[var(--panel-2)] px-2.5 py-2 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-[var(--accent)]"
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center bg-accent text-black transition-transform hover:scale-105 disabled:opacity-40"
                aria-label="sign guestbook"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-zinc-600">
              <span>real wall · be kind</span>
              <span className="tabular-nums">{draft.length}/140</span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
