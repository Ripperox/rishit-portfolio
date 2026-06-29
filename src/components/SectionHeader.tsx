import type { ReactNode } from 'react'

export default function SectionHeader({
  index,
  command,
  title,
  children,
}: {
  index: string
  command: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-zinc-500">
        <span className="text-zinc-700">{index}</span>
        <span className="h-px w-8 bg-[var(--line)]" />
        <span className="text-accent">$ {command}</span>
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
      {children && <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-zinc-400">{children}</p>}
    </div>
  )
}
