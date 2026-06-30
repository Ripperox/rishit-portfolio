import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { Activity, Zap, ShieldCheck } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

const METRICS = [
  { icon: Activity, value: '1000+', label: 'concurrent users / replica', sub: 'shared Redis pub/sub fanout' },
  { icon: Zap, value: '<1s', label: 'price fanout, end to end', sub: 'Yellowstone gRPC → Rust → WS' },
  { icon: ShieldCheck, value: '99%', label: 'init delivery @ 1k req/s', sub: 'up from 89% after K6-driven refactor' },
]

export default function ScrollShowcase() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const split = new SplitText('.show-title', { type: 'chars' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.pin-panel',
          pin: '.pin-panel',
          start: 'top top',
          end: () => '+=' + (window.innerWidth < 768 ? 700 : 1300),
          scrub: 0.6,
        },
      })

      tl.from('.show-eyebrow', { opacity: 0, y: 20 })
        .from(
          split.chars,
          { yPercent: 120, opacity: 0, stagger: 0.018, ease: 'power3.out' },
          '<0.1',
        )
        .from('.show-metric', { opacity: 0, y: 30, stagger: 0.25 }, '>-0.1')
        .fromTo('.show-bar', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)

      return () => split.revert()
    },
    { scope, dependencies: [] },
  )

  return (
    <section ref={scope} className="relative">
      <div className="pin-panel relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 sm:px-6">
        {/* scrub progress bar */}
        <div className="absolute left-0 top-0 h-[2px] w-full origin-left bg-accent show-bar" />

        <div className="mx-auto w-full max-w-5xl">
          <div className="show-eyebrow flex items-center gap-3 text-[11px] tracking-[0.25em] text-zinc-500">
            <span className="h-px w-10 bg-accent" />
            THE THESIS
          </div>

          <h2 className="show-title mt-5 font-display text-4xl font-bold leading-[0.98] tracking-tight text-zinc-100 sm:text-6xl lg:text-7xl">
            REALTIME ISN'T A FEATURE.<br />
            <span className="text-accent text-glow">IT'S THE PRODUCT.</span>
          </h2>

          <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-zinc-400">
            Anyone can ship a screen. The hard part is keeping it{' '}
            <span className="text-zinc-200">fast and correct when everyone shows up at once</span> — which is
            exactly the layer I build.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {METRICS.map((m) => (
              <div key={m.label} className="show-metric corner-frame panel-2 p-4">
                <m.icon className="mb-3 h-5 w-5 text-accent" />
                <div className="font-display text-4xl font-bold tabular-nums text-zinc-100">{m.value}</div>
                <div className="mt-1 text-[12px] text-zinc-300">{m.label}</div>
                <div className="mt-0.5 text-[11px] text-zinc-600">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
