import { useEffect, useRef } from 'react'
import { useMode } from '../lib/mode'

/* Lazy-loaded OGL fragment-shader background: a drifting dot-grid + breathing
   accent glow + cursor halo + grain. ~10kb (ogl), DPR-capped, pauses when the
   tab is hidden, and renders a single static frame under prefers-reduced-motion. */

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uAccent;
  uniform vec2 uMouse;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv;
    p.x *= uRes.x / uRes.y;

    // drifting dot grid
    float scale = 30.0;
    vec2 gp = p * scale;
    gp.y += uTime * 0.18;
    vec2 gid = floor(gp);
    vec2 gf = fract(gp) - 0.5;
    float d = length(gf);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.1 + (gid.x + gid.y) * 0.7);
    float dot = smoothstep(0.15, 0.03, d) * (0.18 + 0.42 * pulse);

    // breathing radial glow (top-left)
    float g1 = smoothstep(0.75, 0.0, distance(uv, vec2(0.16, 0.82)));
    g1 = pow(g1, 2.4) * (0.55 + 0.25 * sin(uTime * 0.5));

    // secondary glow (bottom-right)
    float g2 = smoothstep(0.62, 0.0, distance(uv, vec2(0.86, 0.16)));
    g2 = pow(g2, 2.6) * 0.4;

    // cursor halo
    float mh = smoothstep(0.22, 0.0, distance(uv, uMouse));

    // grain
    float n = hash(uv * uRes.xy * 0.5 + uTime) - 0.5;

    vec3 col = vec3(0.0);
    col += uAccent * dot * 0.55;
    col += uAccent * g1 * 0.10;
    col += uAccent * g2 * 0.06;
    col += uAccent * mh * 0.22;
    col += n * 0.015;

    // vignette
    float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`

const ACCENT_RGB: Record<string, [number, number, number]> = {
  terminal: [0.0, 1.0, 0.62], // #00ff9d
  showcase: [0.25, 0.87, 0.75], // #3fdfbe
}

export default function Background() {
  const ref = useRef<HTMLDivElement>(null)
  const { mode } = useMode()
  const accentRef = useRef(ACCENT_RGB[mode])
  accentRef.current = ACCENT_RGB[mode]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let renderer: any
    let cancelled = false
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
    }

    ;(async () => {
      const { Renderer, Program, Mesh, Triangle } = await import('ogl')
      if (cancelled || !ref.current) return

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      renderer = new Renderer({ dpr, alpha: false, antialias: false })
      const gl = renderer.gl
      gl.clearColor(0.035, 0.035, 0.043, 1)
      ref.current.appendChild(gl.canvas)
      Object.assign(gl.canvas.style, { width: '100%', height: '100%', display: 'block' })

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: [1, 1] },
          uAccent: { value: accentRef.current },
          uMouse: { value: [0.5, 0.5] },
        },
      })
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

      const resize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        renderer.setSize(w, h)
        program.uniforms.uRes.value = [w * dpr, h * dpr]
      }
      resize()
      window.addEventListener('resize', resize)
      window.addEventListener('pointermove', onMove)

      const render = (t: number) => {
        mouse.x += (mouse.tx - mouse.x) * 0.06
        mouse.y += (mouse.ty - mouse.y) * 0.06
        program.uniforms.uTime.value = t * 0.001
        program.uniforms.uMouse.value = [mouse.x, mouse.y]
        program.uniforms.uAccent.value = accentRef.current
        renderer.render({ scene: mesh })
        if (!reduced && !document.hidden) raf = requestAnimationFrame(render)
      }
      const onVis = () => {
        if (!document.hidden && !reduced) raf = requestAnimationFrame(render)
      }
      document.addEventListener('visibilitychange', onVis)
      render(0)

      // store cleanup on the element for the outer cleanup to find
      ;(el as any)._cleanup = () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', onMove)
        document.removeEventListener('visibilitychange', onVis)
        const ext = gl.getExtension('WEBGL_lose_context')
        ext?.loseContext()
        gl.canvas.remove()
      }
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ;(el as any)?._cleanup?.()
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* OGL canvas mounts here */}
      <div ref={ref} className="absolute inset-0" />
      {/* CSS vignette on top of the shader keeps foreground readable */}
      <div className="absolute inset-0 [background:radial-gradient(120%_85%_at_50%_-10%,transparent_50%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  )
}
