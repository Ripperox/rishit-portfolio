const TICKER = [
  'Rust · Tokio · Axum',
  'p99 12ms',
  '1000+ concurrent / replica',
  'WS fanout < 1s',
  '99% delivery @ 1k req/s',
  'React · TypeScript · Next.js',
  'Postgres · Redis · SQLx',
  'K6 · Playwright · Grafana',
  'edge · serverless · Vercel',
]

export default function Ticker({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-7 overflow-hidden border-b border-[var(--line)] bg-[var(--panel-2)] ${className}`}>
      <div className="marquee-track flex h-full w-max items-center gap-8 whitespace-nowrap pr-8 text-[11px] tabular-nums text-zinc-500">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="text-zinc-400">{t}</span>
            <span className="text-zinc-700">/</span>
          </span>
        ))}
      </div>
    </div>
  )
}
