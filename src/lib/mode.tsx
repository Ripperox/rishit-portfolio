import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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
