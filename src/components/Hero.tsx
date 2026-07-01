import { ArrowRight, Download, Mail, MapPin, Briefcase } from 'lucide-react'
import Terminal from './Terminal'
import { m } from '../lib/motion'
import { useView } from '../lib/view'
import { PROFILE, ABOUT, HIGHLIGHTS, FOCUS } from '../lib/data'

const EASE = [0.22, 1, 0.36, 1] as const
const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
})

const TITLE_WORDS = ['RISHIT', 'DHOTE']

export default function Hero() {
  const { setView } = useView()

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — identity + about + actions */}
        <div>
          <m.div {...fade(0.05)} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center border border-accent font-display text-base font-bold text-accent glow-accent">
              RD
            </span>
            <div className="text-[11px] leading-tight text-zinc-500">
              <div className="flex items-center gap-2 tracking-[0.22em]">
                <span className="h-px w-6 bg-accent" /> SOFTWARE ENGINEER
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {PROFILE.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> @ {PROFILE.current}
                </span>
              </div>
            </div>
          </m.div>

          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
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

          <m.div {...fade(0.5)} className="mt-3 font-display text-[15px] font-semibold text-accent">
            {PROFILE.role}
          </m.div>

          <m.p {...fade(0.58)} className="mt-4 max-w-xl text-[14px] leading-relaxed text-zinc-400">
            <span className="text-zinc-300">{ABOUT[0]}</span> {ABOUT[1]}
          </m.p>

          <m.div {...fade(0.66)} className="mt-4 flex flex-wrap gap-1.5">
            {FOCUS.map((f) => (
              <span key={f} className="border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[11px] text-zinc-400">
                {f}
              </span>
            ))}
          </m.div>

          <m.div {...fade(0.74)} className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setView('work')}
              className="glass-btn group flex items-center gap-2 border border-accent px-4 py-2.5 text-[13px] font-medium text-accent transition-all hover:glow-accent"
            >
              View my work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href={PROFILE.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <Download className="h-4 w-4" /> Résumé
            </a>
            <button
              onClick={() => setView('contact')}
              className="flex items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <Mail className="h-4 w-4" /> Contact
            </button>
          </m.div>

          <m.div {...fade(0.82)} className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="panel-2 corner-frame px-3 py-3">
                <div className="font-display text-lg font-semibold tabular-nums text-zinc-100">{h.value}</div>
                <div className="mt-0.5 text-[10px] leading-tight text-zinc-500">{h.label}</div>
              </div>
            ))}
          </m.div>
        </div>

        {/* RIGHT — interactive terminal (the signature flourish) */}
        <m.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: EASE }}>
          <Terminal />
          <div className="mt-2 flex items-center justify-between px-1 text-[10.5px] text-zinc-600">
            <span>interactive · type real commands</span>
            <span className="flex items-center gap-1.5">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" /> try <span className="text-accent">help</span>
            </span>
          </div>
        </m.div>
      </div>
    </section>
  )
}
