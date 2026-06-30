export async function getJSON<T = any>(url: string, opts?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(url, opts)
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

export function timeAgo(t: number): string {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return `${Math.max(1, s)}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function flag(country?: string | null): string {
  if (!country || country.length !== 2) return '🌐'
  const A = 0x1f1e6
  return String.fromCodePoint(...[...country.toUpperCase()].map((c) => A + c.charCodeAt(0) - 65))
}
