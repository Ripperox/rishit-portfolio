import { useEffect, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { Github, Star, GitFork, Users, ArrowUpRight, GitCommitHorizontal } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { Reveal } from '../lib/motion'
import { getJSON, timeAgo } from '../lib/api'
import { PROFILE } from '../lib/data'

type Lang = { name: string; count: number }
type Repo = { name: string; desc: string | null; lang: string | null; stars: number; pushedAt: string; url: string }
type Push = { repo: string; commits: number; at: string }
type GH = {
  live: boolean
  repos: number
  stars: number
  followers: number
  topLangs: Lang[]
  recent: Repo[]
  pushEvents: Push[]
  lastActive: string | null
  url?: string
}

const LANG_COLOR: Record<string, string> = {
  Rust: '#dea584',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Solidity: '#AA6746',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89e051',
}

export default function GitHubActivity() {
  const [gh, setGh] = useState<GH | null>(null)

  useEffect(() => {
    getJSON<GH>('/api/github').then((d) => d && setGh(d))
  }, [])

  const totalLang = gh?.topLangs?.reduce((s, l) => s + l.count, 0) || 1
  const stats = [
    { icon: Github, label: 'repositories', value: gh?.repos ?? 0 },
    { icon: Star, label: 'total stars', value: gh?.stars ?? 0 },
    { icon: Users, label: 'followers', value: gh?.followers ?? 0 },
  ]

  return (
    <Reveal as="section" id="github" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <SectionHeader index="06" command="gh api /users/rishit" title="Build Log">
        Pulled <span className="text-zinc-200">live</span> from GitHub — real repos, stars, and recent pushes.
        Proof I actually ship, not just claim it.
      </SectionHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* stats + languages */}
        <div className="corner-frame panel flex flex-col p-5">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="border border-[var(--line)] bg-[var(--panel-2)] px-2.5 py-3 text-center">
                <s.icon className="mx-auto mb-2 h-4 w-4 text-accent" />
                <div className="font-display text-xl font-semibold tabular-nums text-zinc-100">
                  <NumberFlow value={s.value} />
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-600">{s.label}</div>
              </div>
            ))}
          </div>

          {/* language bar */}
          <div className="mt-5">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">top languages</div>
            <div className="flex h-2.5 w-full overflow-hidden border border-[var(--line)]">
              {gh?.topLangs?.length ? (
                gh.topLangs.map((l) => (
                  <div
                    key={l.name}
                    style={{ width: `${(l.count / totalLang) * 100}%`, background: LANG_COLOR[l.name] || '#52525b' }}
                    title={`${l.name} (${l.count})`}
                  />
                ))
              ) : (
                <div className="w-full bg-[var(--panel-2)]" />
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-500">
              {gh?.topLangs?.map((l) => (
                <span key={l.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2" style={{ background: LANG_COLOR[l.name] || '#52525b' }} />
                  {l.name}
                </span>
              ))}
            </div>
          </div>

          <a
            href={PROFILE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-2)] py-2.5 text-[12px] text-zinc-300 transition-colors hover:border-accent hover:text-accent"
          >
            <Github className="h-3.5 w-3.5" /> @{PROFILE.github}
            {gh?.lastActive && <span className="text-zinc-600">· active {timeAgo(Date.parse(gh.lastActive))}</span>}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* recent repos */}
        <div className="corner-frame panel p-5">
          <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
            <GitCommitHorizontal className="h-3.5 w-3.5 text-accent" /> recently pushed
          </div>
          <div className="space-y-2">
            {gh?.recent?.length ? (
              gh.recent.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block border border-[var(--line)] bg-[var(--panel-2)] p-3 transition-colors hover:border-zinc-600"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[13px] font-medium text-zinc-200 group-hover:text-accent">{r.name}</span>
                    {r.lang && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLOR[r.lang] || '#52525b' }} />
                        {r.lang}
                      </span>
                    )}
                    {r.stars > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                        <Star className="h-2.5 w-2.5" /> {r.stars}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] tabular-nums text-zinc-600">{timeAgo(Date.parse(r.pushedAt))}</span>
                  </div>
                  {r.desc && <p className="mt-1 line-clamp-1 text-[11.5px] text-zinc-500">{r.desc}</p>}
                </a>
              ))
            ) : (
              <p className="py-8 text-center text-[12px] text-zinc-600">loading build log…</p>
            )}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-600">
            <GitFork className="h-3 w-3" /> live from the GitHub API · cached 10 min
          </p>
        </div>
      </div>
    </Reveal>
  )
}
