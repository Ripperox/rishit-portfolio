import { useState } from 'react'
import { Cpu, FolderGit2, FileCode2, Github, ArrowUpRight, Play } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { Reveal } from '../lib/motion'
import { SKILL_GROUPS, PROJECTS, type SkillNode } from '../lib/data'

const TAG_COLOR: Record<string, string> = {
  realtime: 'var(--accent)',
  systems: 'var(--cyan)',
  devtools: 'var(--purple)',
  algorithms: 'var(--amber)',
}

export default function SkillsMatrix() {
  const [active, setActive] = useState<SkillNode | null>(null)

  return (
    <Reveal as="section" id="skills" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <SectionHeader index="03" command="cat stack.json && ls ~/work" title="Stack & Selected Work">
        Full-path depth — type-safe Rust services, realtime systems, and full-stack TypeScript. Hover any node
        for detail; the work on the right is real and shippable.
      </SectionHeader>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_1.25fr]">
        {/* CAPABILITY MATRIX */}
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
                      <span className="tabular-nums text-[10px] text-zinc-600 group-hover:text-zinc-400">{s.level}</span>
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[var(--line)]">
                        <span className="block h-full transition-all duration-500" style={{ width: `${s.level}%`, background: g.accent }} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

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
              <p className="text-[12px] text-zinc-600">hover a node to inspect proficiency &amp; usage…</p>
            )}
          </div>
        </div>

        {/* SELECTED WORK */}
        <div className="corner-frame panel p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <FolderGit2 className="h-3.5 w-3.5 text-accent" /> selected work
          </div>

          <div className="space-y-2.5">
            {PROJECTS.map((p) => {
              const color = TAG_COLOR[p.tag] || 'var(--muted)'
              return (
                <div
                  key={p.name}
                  className="group border border-[var(--line)] bg-[var(--panel-2)] p-3.5 transition-colors hover:border-zinc-600"
                  style={{ borderLeft: `2px solid ${color}` }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[15px] font-semibold text-zinc-100">{p.name}</span>
                    <span
                      className="border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                      style={{ borderColor: `color-mix(in srgb, ${color} 45%, var(--line))`, color }}
                    >
                      {p.tag}
                    </span>
                    {p.demo && (
                      <span className="border border-[var(--line)] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-zinc-500">
                        interactive demo
                      </span>
                    )}
                    {p.repo ? (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-accent"
                      >
                        <Github className="h-3.5 w-3.5" /> code <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : p.live ? (
                      <a
                        href={p.live}
                        className="ml-auto flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-accent"
                      >
                        <Play className="h-3 w-3" /> try it <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-zinc-400">{p.blurb}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.stack.map((t) => (
                      <span key={t} className="border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-zinc-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Reveal>
  )
}
