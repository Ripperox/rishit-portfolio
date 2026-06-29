import { redis, geoFrom, visitorHash, parseJSON } from './_lib.js'

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

    const raw = await redis.lrange(RECENT_KEY, 0, 199)
    const recent = raw.map(parseJSON).filter(Boolean)

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ live: true, total: Number(total), yourNumber: Number(yourNumber), recent, you })
  } catch (err) {
    return res.status(200).json({ live: false, total: null, yourNumber: null, recent: [], you, error: String(err?.message || err) })
  }
}
