import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

export type Marker = { location: [number, number]; size: number }

/* cobe v2: create the globe ONCE, then drive the spin via a rAF loop and push
   marker/color changes through globe.update() — no destroy/recreate churn (which
   raced update() against destroy() and could throw). Fully guarded so a WebGL
   hiccup can never crash the view. */
export default function Globe({
  markers,
  markerColor = [0, 1, 0.62],
}: {
  markers: Marker[]
  markerColor?: [number, number, number]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<{ update: (s: any) => void; destroy: () => void } | null>(null)
  const phiRef = useRef(0)
  const interacting = useRef<number | null>(null)
  const movement = useRef(0)
  const markersRef = useRef(markers)
  markersRef.current = markers

  // create once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let destroyed = false
    let raf = 0
    let width = canvas.offsetWidth || 360

    const onResize = () => {
      width = canvas.offsetWidth || width
      try {
        globeRef.current?.update({ width: width * 2, height: width * 2 })
      } catch {
        /* noop */
      }
    }
    window.addEventListener('resize', onResize)

    let globe: ReturnType<typeof createGlobe> | null = null
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.28,
        dark: 1,
        diffuse: 1.3,
        mapSamples: 16000,
        mapBrightness: 7.5,
        baseColor: [0.24, 0.27, 0.32],
        markerColor,
        glowColor: [0.12, 0.42, 0.34],
        markers: markersRef.current,
      })
    } catch {
      window.removeEventListener('resize', onResize)
      return
    }
    globeRef.current = globe

    let phi = phiRef.current
    const render = () => {
      if (destroyed) return
      if (interacting.current === null) phi += 0.0035
      try {
        globe!.update({ phi: phi + movement.current * 0.01 })
      } catch {
        return
      }
      phiRef.current = phi
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    const fade = setTimeout(() => {
      if (canvas) canvas.style.opacity = '1'
    }, 120)

    return () => {
      destroyed = true
      clearTimeout(fade)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      try {
        globe?.destroy()
      } catch {
        /* noop */
      }
      globeRef.current = null
    }
  }, [])

  // push marker / color updates without recreating the globe
  useEffect(() => {
    try {
      globeRef.current?.update({ markers, markerColor })
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), markerColor.join(',')])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 68%)',
          filter: 'blur(22px)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative h-full w-full opacity-0 transition-opacity duration-700"
        style={{ contain: 'layout paint size', cursor: 'grab', touchAction: 'pan-y' }}
        onPointerDown={(e) => {
          interacting.current = e.clientX - movement.current
          e.currentTarget.style.cursor = 'grabbing'
        }}
        onPointerUp={(e) => {
          interacting.current = null
          e.currentTarget.style.cursor = 'grab'
        }}
        onPointerOut={(e) => {
          interacting.current = null
          e.currentTarget.style.cursor = 'grab'
        }}
        onPointerMove={(e) => {
          if (interacting.current !== null) movement.current = e.clientX - interacting.current
        }}
      />
    </div>
  )
}
