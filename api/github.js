import { redis, parseJSON } from './_lib.js'

const USER = 'Ripperox'
const CACHE_KEY = 'gh:cache:v1'

export default async function handler(req, res) {
  try {
    if (redis) {
      const cached = parseJSON(await redis.get(CACHE_KEY))
      if (cached) {
        res.setHeader('Cache-Control', 's-maxage=600')
        return res.status(200).json({ ...cached, cached: true })
      }
    }

    const headers = { 'User-Agent': 'rishit-portfolio', Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USER}`, { headers }),
      fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, { headers }),
      fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`, { headers }),
    ])

    if (!userRes.ok || !reposRes.ok) {
      return res.status(200).json({ live: false, error: `github ${userRes.status}/${reposRes.status}` })
    }

    const user = await userRes.json()
    const repos = await reposRes.json()
    const events = eventsRes.ok ? await eventsRes.json() : []

    const owned = Array.isArray(repos) ? repos.filter((r) => !r.fork) : []
    const stars = owned.reduce((s, r) => s + (r.stargazers_count || 0), 0)

    const langCount = {}
    owned.forEach((r) => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1
    })
    const topLangs = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }))

    const recent = owned.slice(0, 5).map((r) => ({
      name: r.name,
      desc: r.description,
      lang: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
    }))

    const pushEvents = Array.isArray(events)
      ? events
          .filter((e) => e.type === 'PushEvent')
          .slice(0, 8)
          .map((e) => ({ repo: e.repo.name.split('/')[1], commits: e.payload?.commits?.length || 0, at: e.created_at }))
      : []

    const data = {
      live: true,
      login: USER,
      name: user.name || USER,
      url: user.html_url,
      repos: owned.length,
      stars,
      followers: user.followers,
      topLangs,
      recent,
      pushEvents,
      lastActive: owned[0]?.pushed_at || null,
      fetchedAt: Date.now(),
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(data), { ex: 600 })
    res.setHeader('Cache-Control', 's-maxage=600')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(200).json({ live: false, error: String(err?.message || err) })
  }
}
