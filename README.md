# rishit.dhote — interactive portfolio

A single-page, highly interactive portfolio built as an immersive **tech-noir crypto trading terminal** — not a resume. Mirrors the design system of the Apeing trading frontend.

**Live:** [rishit-portfolio-xi.vercel.app](https://rishit-portfolio-xi.vercel.app)

## Highlights

- **Command center** — a real in-page terminal (type `help`, `skills`, `alpharooms`, `lab`, `contact`, `clear`) plus a global **⌘K command palette** (cmdk).
- **Alpharooms live demo** — a working preview of a realtime SocialFi trading room: a streaming **TradingView candlestick chart**, a live order book, an auto-animating chat, a voice room with audio-wave indicators, and a Live⇄Architecture toggle revealing the Rust · Tokio · Redis · SQLx stack.
- **Throughput Lab** — an interactive **Node.js vs Rust** load simulator: drag the concurrency slider, flip between I/O-bound and CPU-bound workloads, and watch per-core meters, p99 sparklines, and a live verdict diverge.
- **Stack & ecosystems** — capability matrix + Solana/TRON toolkits.
- **Motion everywhere** — Motion (Framer) reveals & transitions, a GSAP scroll-scrubbed pinned showcase, NumberFlow rolling stats, and a lazy-loaded **OGL shader background**.
- A **Terminal ⇄ Showcase** mode toggle that re-themes the whole site.

## Stack

React 18 · Vite 6 · TypeScript · Tailwind CSS v4 · Motion · GSAP · lightweight-charts · cmdk · OGL · sonner · lucide-react

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

---

Built by **Rishit Dhote** · [github.com/Ripperox](https://github.com/Ripperox)
