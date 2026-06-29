import { useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Boxes, Cpu, Coins, FileCode2, Flame, Zap, ArrowUpRight } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { Reveal, m, AnimatePresence } from '../lib/motion'
import { SKILL_GROUPS, ECOSYSTEMS, type SkillNode } from '../lib/data'

export default function SkillsMatrix() {
  const [active, setActive] = useState<SkillNode | null>(null)
  const [chain, setChain] = useState(ECOSYSTEMS[0].key)

  const current = ECOSYSTEMS.find((c) => c.key === chain)!

  return (
    <Reveal as="section" id="skills" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeader index="03" command="cat stack.json && map --chains" title="Stack & Ecosystems">
        Depth across the full path — type-safe Rust services, realtime React, and hands-on tooling inside
        high-velocity chains. Hover any node for detail; switch chains to inspect the on-chain toolkit.
      </SectionHeader>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* SKILL MATRIX */}
        <div className="corner-frame panel p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <Cpu className="h-3.5 w-3.5 text-accent" /> capability matrix
          </div>

          <div className="space-y-5">
            {SKILL_GROUPS.map((g) => (
              <div key={g.key}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2" style={{ background: g.accent }} />
                  <span className="text-[12px] font-semibold tracking-wide text-zinc-300">{g.label}</span>
                  <span className="ml-auto text-[10px] text-zinc-600">{g.items.length} nodes</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <button
                      key={s.name}
                      onMouseEnter={() => setActive(s)}
                      onFocus={() => setActive(s)}
                      onMouseLeave={() => setActive((a) => (a?.name === s.name ? null : a))}
                      className="group relative flex items-center gap-2 border border-[var(--line)] bg-[var(--panel-2)] px-2.5 py-1.5 text-[12px] text-zinc-300 transition-all hover:border-[color:var(--accent)] hover:text-white"
                      style={{ '--accent': g.accent } as React.CSSProperties}
                    >
                      <span>{s.name}</span>
                      <span className="tabular-nums text-[10px] text-zinc-600 group-hover:text-zinc-400">
                        {s.level}
                      </span>
                      {/* proficiency underline */}
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[var(--line)]">
                        <span
                          className="block h-full transition-all duration-500"
                          style={{ width: `${s.level}%`, background: g.accent }}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* detail readout */}
          <div className="mt-5 flex min-h-[52px] items-start gap-3 border border-dashed border-[var(--line)] bg-black/25 p-3">
            <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {active ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold text-zinc-100">{active.name}</span>
                  <span className="font-display text-[12px] tabular-nums text-accent">{active.level}/100</span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-zinc-400">{active.blurb}</p>
              </div>
            ) : (
              <p className="text-[12px] text-zinc-600">hover a node to inspect proficiency & usage…</p>
            )}
          </div>
        </div>

        {/* ECOSYSTEM MAP */}
        <div className="corner-frame panel flex flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <Boxes className="h-3.5 w-3.5 text-accent" /> chain ecosystems
          </div>

          {/* chain switch */}
          <div className="mb-4 flex gap-1.5">
            {ECOSYSTEMS.map((c) => (
              <button
                key={c.key}
                onClick={() => setChain(c.key)}
                className="flex flex-1 items-center justify-center gap-2 border px-3 py-2 text-[12px] font-semibold transition-all"
                style={{
                  borderColor: chain === c.key ? c.color : 'var(--line)',
                  color: chain === c.key ? c.color : 'var(--muted)',
                  background: chain === c.key ? `color-mix(in srgb, ${c.color} 12%, transparent)` : 'transparent',
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                {c.name}
              </button>
            ))}
          </div>

          {/* active chain card */}
          <div className="flex-1">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-2xl font-bold text-zinc-100">{current.name}</div>
                <div className="text-[11px] tracking-wide text-zinc-500">${current.ticker} · mainnet</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold tabular-nums" style={{ color: current.color }}>
                  <NumberFlow value={current.level} />
                </div>
                <div className="text-[10px] uppercase tracking-wide text-zinc-600">proficiency</div>
              </div>
            </div>

            {/* level bar */}
            <div className="mt-3 h-1.5 w-full bg-[var(--panel-2)]">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${current.level}%`, background: current.color, boxShadow: `0 0 12px ${current.color}` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <m.div
                key={chain}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">{current.desc}</p>

                {/* stats */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {current.stats.map((s) => (
                    <div key={s.label} className="border border-[var(--line)] bg-[var(--panel-2)] px-2 py-2 text-center">
                      <div className="font-display text-sm font-semibold tabular-nums text-zinc-100">{s.value}</div>
                      <div className="text-[9px] uppercase tracking-wide text-zinc-600">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* tools */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
                    <Zap className="h-3 w-3" style={{ color: current.color }} /> toolkit
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {current.tools.map((t) => (
                      <span
                        key={t.label}
                        className="flex items-center gap-1 border px-2 py-1 text-[11px] transition-colors"
                        style={{
                          borderColor: t.hot ? `color-mix(in srgb, ${current.color} 45%, var(--line))` : 'var(--line)',
                          color: t.hot ? current.color : 'var(--muted)',
                          background: t.hot ? `color-mix(in srgb, ${current.color} 8%, transparent)` : 'transparent',
                        }}
                      >
                        {t.hot && <Flame className="h-3 w-3" />}
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </m.div>
            </AnimatePresence>
          </div>

          {/* footnote */}
          <div className="mt-4 flex items-center gap-2 border-t border-[var(--line)] pt-3 text-[11px] text-zinc-500">
            <Coins className="h-3.5 w-3.5" style={{ color: current.color }} />
            Built custom token generators & smart-contract integrations on both chains
            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-zinc-600" />
          </div>
        </div>
      </div>
    </Reveal>
  )
}
