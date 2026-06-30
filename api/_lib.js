import { Redis } from '@upstash/redis'
import crypto from 'node:crypto'

/* Redis client — null when env vars are absent so every endpoint can degrade
   gracefully (the site still works; live data "activates" once Upstash is added). */
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
export const redis = url && token ? new Redis({ url, token }) : null

/* Coarse, privacy-preserving geolocation from Vercel's edge headers.
   Coordinates are rounded to ~city level; no IP or PII is ever stored. */
export function geoFrom(req) {
  const h = req.headers
  const lat = parseFloat(h['x-vercel-ip-latitude'])
  const lng = parseFloat(h['x-vercel-ip-longitude'])
  let city = h['x-vercel-ip-city'] || null
  try {
    if (city) city = decodeURIComponent(city)
  } catch {
    /* keep raw */
  }
  const country = h['x-vercel-ip-country'] || null
  const region = h['x-vercel-ip-country-region'] || null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat: null, lng: null, city, region, country }
  return { lat: Math.round(lat * 10) / 10, lng: Math.round(lng * 10) / 10, city, region, country }
}

/* Trusted client IP. Prefer Vercel's x-real-ip (set by the platform); the
   leftmost x-forwarded-for entry is client-spoofable, so fall back to the
   LAST hop only. Used transiently for org lookup / hashing — never persisted. */
export function rawIP(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean)
  return req.headers['x-real-ip'] || xff[xff.length - 1] || null
}

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/
const isValidIP = (ip) => !!ip && (IPV4.test(ip) || ip.includes(':'))
const isPrivateIP = (ip) =>
  /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd|fe80)/i.test(ip || '')

/* Lightweight UA → browser/os/device (no dependency). */
export function parseUA(ua = '') {
  let browser = 'unknown'
  let os = 'unknown'
  let device = 'desktop'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua)) browser = 'Safari'
  if (/Windows NT/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Linux/.test(ua)) os = 'Linux'
  if (/iPad|Tablet/.test(ua)) device = 'tablet'
  else if (/Mobile|iPhone|Android/.test(ua)) device = 'mobile'
  return { browser, os, device }
}

/* Resolve org/ISP/company from an IP at request time, cached by IP-hash so the
   raw IP is never stored. Returns { org, isp, asn, flags } or nulls on failure. */
export async function lookupOrg(ip, redis) {
  if (!isValidIP(ip) || isPrivateIP(ip)) return { org: null, isp: null, asn: null }
  const salt = process.env.HASH_SALT || 'rishit-portfolio'
  const key = 'org:' + crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 16)
  if (redis) {
    const cached = parseJSON(await redis.get(key))
    if (cached) return cached
  }
  try {
    // HTTPS (no cleartext IP transit), org/ISP/ASN only
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,connection`, {
      signal: AbortSignal.timeout(2500),
    })
    const d = await r.json()
    const c = (d && d.connection) || {}
    const out = { org: c.org || c.isp || null, isp: c.isp || null, asn: c.asn ? 'AS' + c.asn : null }
    if (redis) await redis.set(key, JSON.stringify(out), { ex: 7 * 86400 })
    return out
  } catch {
    return { org: null, isp: null, asn: null }
  }
}

/* Stable per-visitor hash from the TRUSTED IP only (UA dropped — it's
   client-controlled and trivially rotatable). IP is hashed and never stored. */
export function visitorHash(req) {
  const salt = process.env.HASH_SALT || 'rishit-portfolio'
  return crypto.createHash('sha256').update((rawIP(req) || 'anon') + salt).digest('hex').slice(0, 16)
}

/* Constant-time secret comparison (admin key). */
export function safeKeyEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export function parseJSON(v) {
  if (v == null) return null
  if (typeof v === 'object') return v
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}
