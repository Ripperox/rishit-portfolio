import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

export type Marker = { location: [number, number]; size: number }

export default function Globe({
  markers,
  markerColor = [0, 1, 0.62],
}: {
  markers: Marker[]
  markerColor?: [number, number, number]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const interacting = useRef<number | null>(null)
  const movement = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let width = 0
    const onResize = () => {
      width = canvas.offsetWidth
    }
    window.addEventListener('resize', onResize)
    onResize()

    let phi = phiRef.current
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.28,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 5.4,
      baseColor: [0.13, 0.14, 0.15],
      markerColor,
      glowColor: [0.05, 0.2, 0.16],
      markers,
      onRender: (state) => {
        if (interacting.current === null) phi += 0.0035
        state.phi = phi + movement.current * 0.01
        state.width = width * 2
        state.height = width * 2
        phiRef.current = phi
      },
    })

    const fade = setTimeout(() => {
      canvas.style.opacity = '1'
    }, 120)

    return () => {
      clearTimeout(fade)
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
    // recreate when markers / color change
  }, [JSON.stringify(markers), markerColor.join(',')])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-700"
        style={{ contain: 'layout paint size', cursor: 'grab' }}
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
