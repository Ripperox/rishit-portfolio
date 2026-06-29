import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react'
import { PROFILE } from '../lib/data'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--panel-2)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="font-display text-sm font-semibold text-zinc-200">
            rishit<span className="text-accent">.</span>dhote
          </div>
          <div className="mt-1 text-[11px] text-zinc-600">
            built with React · Tailwind · canvas — no templates, no slop. © 2026
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent" aria-label="GitHub">
            <Github className="h-4 w-4" />
          </a>
          <a href={PROFILE.linkedinUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent" aria-label="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href={`mailto:${PROFILE.email}`} className="grid h-9 w-9 place-items-center border border-[var(--line)] text-zinc-400 transition-colors hover:border-accent hover:text-accent" aria-label="Email">
            <Mail className="h-4 w-4" />
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="ml-2 flex items-center gap-1.5 border border-[var(--line)] px-3 py-2 text-[11px] text-zinc-400 transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowUp className="h-3.5 w-3.5" /> top
          </button>
        </div>
      </div>
    </footer>
  )
}
