import { redis, parseJSON, safeKeyEqual } from '../_lib.js'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const flag = (c) => {
  if (!c || c.length !== 2) return '🌐'
  return String.fromCodePoint(...[...c.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}

const ago = (t) => {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return s + 's'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

const host = (u) => {
  if (!u) return 'direct'
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return u.slice(0, 30)
  }
}

const topN = (people, key, n = 6) => {
  const m = {}
  people.forEach((p) => {
    const v = key(p)
    if (v) m[v] = (m[v] || 0) + 1
  })
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

export default async function handler(req, res) {
  const key = req.query?.key
  if (!process.env.ADMIN_KEY) return res.status(503).json({ error: 'ADMIN_KEY not configured' })
  if (!safeKeyEqual(String(key || ''), process.env.ADMIN_KEY)) return res.status(403).json({ error: 'forbidden' })
  if (!redis) return res.status(503).json({ error: 'storage not configured' })

  const all = (await redis.hgetall('visits:people')) || {}
  const people = Object.values(all)
    .map(parseJSON)
    .filter(Boolean)
    .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))

  const hits = (await redis.lrange('visits:hits', 0, 99)).map(parseJSON).filter(Boolean)
  const totalHits = Number(await redis.get('visits:total')) || people.length

  if (req.query?.format === 'json') {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ unique: people.length, people, hits })
  }

  const totalVisits = people.reduce((s, p) => s + (p.visits || 0), 0)
  const countries = topN(people, (p) => p.country)
  const orgs = topN(people, (p) => p.org)
  const refs = topN(people, (p) => host(p.ref))

  const card = (label, value) =>
    `<div class="card"><div class="lbl">${label}</div><div class="val">${value}</div></div>`
  const chips = (arr) =>
    arr.map(([k, v]) => `<span class="chip">${esc(k)} <b>${v}</b></span>`).join('') || '<span class="muted">—</span>'

  const rows = people
    .slice(0, 500)
    .map(
      (p) => `<tr>
      <td class="accent">#${p.n ?? '—'}</td>
      <td>${ago(p.lastSeen)} ago</td>
      <td>${p.visits ?? 1}</td>
      <td>${flag(p.country)} ${esc(p.city || '?')}${p.region ? ', ' + esc(p.region) : ''} <span class="muted">${esc(p.country || '')}</span></td>
      <td>${p.org ? esc(p.org) : '<span class="muted">—</span>'}</td>
      <td>${esc(p.device)} · ${esc(p.browser)} / ${esc(p.os)}</td>
      <td>${esc(host(p.ref))}</td>
    </tr>`,
    )
    .join('')

  const hitRows = hits
    .map(
      (hh) => `<tr>
      <td>${ago(hh.t)} ago</td>
      <td>${hh.isNew ? '<span class="accent">NEW</span>' : '<span class="muted">·</span>'}</td>
      <td>${flag(hh.country)} ${esc(hh.city || '?')} <span class="muted">${esc(hh.country || '')}</span></td>
      <td>${hh.org ? esc(hh.org) : '<span class="muted">—</span>'}</td>
      <td>${esc(hh.device)} · ${esc(hh.browser)}</td>
      <td>${esc(host(hh.ref))}</td>
    </tr>`,
    )
    .join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>visitors · private</title>
  <style>
    :root{--ac:#00ff9d}
    *{box-sizing:border-box}
    body{background:#09090b;color:#e4e4e7;font-family:ui-monospace,'SF Mono',Menlo,monospace;margin:0;padding:22px;font-size:13px}
    h1{font-size:18px;margin:0 0 2px}
    .sub{color:#71717a;font-size:11px;margin-bottom:18px}
    .accent{color:var(--ac)}
    .muted{color:#52525b}
    .cards{margin-bottom:16px}
    .card{display:inline-block;border:1px solid #27272a;background:#121217;padding:10px 16px;margin:0 8px 8px 0;vertical-align:top}
    .card .lbl{color:#71717a;font-size:9px;text-transform:uppercase;letter-spacing:.12em}
    .card .val{font-size:22px;font-weight:600;color:#fff;margin-top:2px}
    .panel{border:1px solid #27272a;background:#0f0f14;padding:12px 14px;margin-bottom:16px}
    .panel h3{margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#71717a}
    .chip{display:inline-block;border:1px solid #27272a;padding:3px 8px;margin:0 6px 6px 0;font-size:11px;color:#a1a1aa}
    .chip b{color:var(--ac)}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #1c1c22;white-space:nowrap}
    th{color:#71717a;text-transform:uppercase;font-size:9px;letter-spacing:.1em;position:sticky;top:0;background:#09090b}
    tr:hover td{background:#101015}
    .wrap{overflow-x:auto;border:1px solid #27272a}
  </style></head><body>
    <h1><span class="accent">●</span> visitor log <span class="muted">// private</span></h1>
    <div class="sub">deduped by person · org resolved from IP at request time, IPs never stored · auto-refresh 30s</div>
    <div class="cards">
      ${card('unique visitors', people.length)}
      ${card('total hits', totalHits)}
      ${card('countries', countries.length)}
      ${card('with company/org', people.filter((p) => p.org).length)}
    </div>
    <div class="panel"><h3>top countries</h3>${chips(countries.map(([k, v]) => [flag(k) + ' ' + k, v]))}</div>
    <div class="panel"><h3>top orgs / ISPs</h3>${chips(orgs)}</div>
    <div class="panel"><h3>referrers</h3>${chips(refs)}</div>

    <h3 style="margin:20px 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#71717a">● recent hits <span class="muted" style="text-transform:none;letter-spacing:0">— live feed, every visit</span></h3>
    <div class="wrap" style="margin-bottom:16px"><table>
      <thead><tr><th>when</th><th></th><th>location</th><th>org / company</th><th>device</th><th>referrer</th></tr></thead>
      <tbody>${hitRows || '<tr><td colspan="6" class="muted" style="padding:20px;text-align:center">no hits yet</td></tr>'}</tbody>
    </table></div>

    <h3 style="margin:20px 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#71717a">unique visitors</h3>
    <div class="wrap"><table>
      <thead><tr><th>#</th><th>last seen</th><th>sessions</th><th>location</th><th>org / company</th><th>device</th><th>referrer</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" class="muted" style="padding:24px;text-align:center">no visitors logged yet</td></tr>'}</tbody>
    </table></div>
    <script>setTimeout(()=>location.reload(),20000)</script>
  </body></html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  return res.status(200).send(html)
}
