import { redis, geoFrom, visitorHash, parseJSON, parseUA, lookupOrg, rawIP } from './_lib.js'

const RECENT_KEY = 'visits:recent'
const TOTAL_KEY = 'visits:total'

export default async function handler(req, res) {
  const you = geoFrom(req)

  // No Redis yet → return the current visitor only; counter "activates" once provisioned.
  if (!redis) {
    return res.status(200).json({ live: false, total: null, yourNumber: null, recent: [], you })
  }

  try {
    const h = visitorHash(req)
    // SET NX with 24h expiry → truthy only the first time this visitor is seen today.
    const isNew = await redis.set(`seen:${h}`, 1, { nx: true, ex: 86400 })

    let total
    let yourNumber
    if (isNew) {
      total = await redis.incr(TOTAL_KEY)
      yourNumber = total
      await redis.set(`num:${h}`, yourNumber, { ex: 86400 })
      if (you.lat != null && you.lng != null) {
        await redis.lpush(RECENT_KEY, JSON.stringify({ lat: you.lat, lng: you.lng, city: you.city, country: you.country, t: Date.now() }))
        await redis.ltrim(RECENT_KEY, 0, 199)
      }
    } else {
      total = Number(await redis.get(TOTAL_KEY)) || 0
      yourNumber = Number(await redis.get(`num:${h}`)) || total
    }

    // ---- internal visitor log (deduped by person; org resolved at request time, IP never stored) ----
    try {
      const existing = parseJSON(await redis.hget('visits:people', h))
      const ua = parseUA(req.headers['user-agent'] || '')
      let org = existing?.org
      let isp = existing?.isp
      if (!org) {
        const o = await lookupOrg(rawIP(req), redis)
        org = o.org
        isp = o.isp
      }
      const person = {
        n: existing?.n || (isNew ? Number(yourNumber) : null),
        firstSeen: existing?.firstSeen || Date.now(),
        lastSeen: Date.now(),
        visits: (existing?.visits || 0) + (isNew ? 1 : 0),
        city: you.city,
        region: you.region,
        country: you.country,
        org: org || null,
        isp: isp || null,
        browser: ua.browser,
        os: ua.os,
        device: ua.device,
        ua: (req.headers['user-agent'] || '').slice(0, 180),
        ref: (req.headers['referer'] || '').slice(0, 200) || null,
        lang: (req.headers['accept-language'] || '').split(',')[0] || null,
      }
      await redis.hset('visits:people', { [h]: JSON.stringify(person) })
    } catch {
      /* logging is best-effort; never block the globe */
    }

    const raw = await redis.lrange(RECENT_KEY, 0, 199)
    const recent = raw.map(parseJSON).filter(Boolean)

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ live: true, total: Number(total), yourNumber: Number(yourNumber), recent, you })
  } catch (err) {
    return res.status(200).json({ live: false, total: null, yourNumber: null, recent: [], you, error: String(err?.message || err) })
  }
}
