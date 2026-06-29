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
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat: null, lng: null, city, country }
  return { lat: Math.round(lat * 10) / 10, lng: Math.round(lng * 10) / 10, city, country }
}

/* Stable per-visitor hash from IP+UA — used only for dedupe/rate-limit.
   The IP is hashed and discarded; it is never persisted. */
export function visitorHash(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'anon'
  const ua = req.headers['user-agent'] || ''
  const salt = process.env.HASH_SALT || 'rishit-portfolio'
  return crypto.createHash('sha256').update(ip + ua + salt).digest('hex').slice(0, 16)
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
