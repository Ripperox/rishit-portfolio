import { GitCommitHorizontal, MapPin, GraduationCap } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { Reveal } from '../lib/motion'
import { EXPERIENCE } from '../lib/data'

const TAG_COLOR: Record<string, string> = {
  realtime: 'var(--accent)',
  rust: 'var(--purple)',
  data: 'var(--cyan)',
  ai: 'var(--amber)',
}

export default function Experience() {
  return (
    <Reveal as="section" id="work" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <SectionHeader index="04" command="git log --career --oneline" title="Career Log">
        Four roles across realtime systems, blockchain infra, and large-scale data — most recent first.
      </SectionHeader>

      <div className="corner-frame panel p-4 sm:p-6">
        <div className="relative">
          {/* vertical rail */}
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--line)]" />

          <div className="space-y-7">
            {EXPERIENCE.map((job, i) => (
              <div key={i} className="relative pl-8">
                {/* commit dot */}
                <span
                  className="absolute left-0 top-1 grid h-4 w-4 place-items-center rounded-full border bg-[var(--bg)]"
                  style={{ borderColor: TAG_COLOR[job.tag] }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: TAG_COLOR[job.tag] }} />
                </span>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-lg font-semibold text-zinc-100">{job.role}</h3>
                  <span className="text-[13px] text-accent">@ {job.company}</span>
                  <span
                    className="border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                    style={{ borderColor: `color-mix(in srgb, ${TAG_COLOR[job.tag]} 45%, var(--line))`, color: TAG_COLOR[job.tag] }}
                  >
                    {job.tag}
                  </span>
                  <span className="ml-auto flex items-center gap-3 text-[11px] tabular-nums text-zinc-500">
                    <span className="flex items-center gap-1">
                      <GitCommitHorizontal className="h-3.5 w-3.5" />
                      {job.period}
                    </span>
                    <span className="hidden items-center gap-1 sm:flex">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  </span>
                </div>

                <ul className="mt-2.5 space-y-1.5">
                  {job.points.map((p, j) => (
                    <li key={j} className="flex gap-2 text-[13px] leading-relaxed text-zinc-400">
                      <span className="mt-2 h-1 w-1 shrink-0 bg-zinc-600" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* education */}
        <div className="mt-7 border-t border-[var(--line)] pt-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <GraduationCap className="h-3.5 w-3.5 text-accent" /> education
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
            <span className="font-semibold text-zinc-200">B.Tech — Computer Science (Blockchain Specialization)</span>
            <span className="text-accent">@ VIT Vellore</span>
            <span className="ml-auto flex items-center gap-3 text-[11px] tabular-nums text-zinc-500">
              <span>GPA 8.11 / 10</span>
              <span>2021 — 2025</span>
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
