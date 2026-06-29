import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type Mode = 'terminal' | 'showcase'

interface ModeCtx {
  mode: Mode
  setMode: (m: Mode) => void
  toggle: () => void
}

const Ctx = createContext<ModeCtx>({
  mode: 'terminal',
  setMode: () => {},
  toggle: () => {},
})

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('terminal')

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode)
  }, [mode])

  const toggle = () => setMode((m) => (m === 'terminal' ? 'showcase' : 'terminal'))

  return <Ctx.Provider value={{ mode, setMode, toggle }}>{children}</Ctx.Provider>
}

export const useMode = () => useContext(Ctx)

/* Reveal-on-scroll: returns a ref to attach to any element with class "reveal" */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
