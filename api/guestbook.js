import { redis, geoFrom, visitorHash, parseJSON } from './_lib.js'

const KEY = 'guestbook'
const MAX_AGE = 48 * 60 * 60 * 1000 // 48h
const BAD = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'retard', 'asshole', 'dick', 'porn', 'rape']

const clean = (s, max) =>
  String(s ?? '')
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // strip control chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

const hasBad = (s) => {
  const low = s.toLowerCase()
  return BAD.some((w) => low.includes(w))
}

async function recentMessages() {
  const raw = await redis.lrange(KEY, 0, 99)
  const cutoff = Date.now() - MAX_AGE
  return raw
    .map(parseJSON)
    .filter((m) => m && m.t > cutoff)
    .slice(0, 50)
}

export default async function handler(req, res) {
  // Admin kill-switch: DELETE /api/guestbook?key=ADMIN_KEY
  if (req.method === 'DELETE') {
    if (!redis) return res.status(503).json({ error: 'not configured' })
    const key = req.query?.key
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'forbidden' })
    await redis.del(KEY)
    return res.status(200).json({ ok: true, messages: [] })
  }

  if (!redis) {
    if (req.method === 'GET') return res.status(200).json({ live: false, messages: [] })
    return res.status(503).json({ error: 'guestbook is warming up — provisioning storage' })
  }

  if (req.method === 'GET') {
    try {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).json({ live: true, messages: await recentMessages() })
    } catch (err) {
      return res.status(200).json({ live: false, messages: [], error: String(err?.message || err) })
    }
  }

  if (req.method === 'POST') {
    try {
      const h = visitorHash(req)
      const ok = await redis.set(`gb:rl:${h}`, 1, { nx: true, ex: 30 })
      if (!ok) return res.status(429).json({ error: 'one message every 30s — hang on a sec' })

      const body = typeof req.body === 'string' ? parseJSON(req.body) || {} : req.body || {}
      const name = clean(body.name, 24) || 'anon'
      const message = clean(body.message, 140)
      if (!message) return res.status(400).json({ error: 'message required' })
      if (hasBad(name + ' ' + message)) return res.status(400).json({ error: 'keep it clean :)' })

      const geo = geoFrom(req)
      const entry = { name, message, city: geo.city, country: geo.country, lat: geo.lat, lng: geo.lng, t: Date.now() }
      await redis.lpush(KEY, JSON.stringify(entry))
      await redis.ltrim(KEY, 0, 99)
      return res.status(200).json({ live: true, ok: true, messages: await recentMessages() })
    } catch (err) {
      return res.status(500).json({ error: String(err?.message || err) })
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return res.status(405).json({ error: 'method not allowed' })
}
