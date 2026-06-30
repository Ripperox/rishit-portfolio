import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type View = 'home' | 'alpharooms' | 'lab' | 'work' | 'live' | 'contact'
export const VIEWS: View[] = ['home', 'alpharooms', 'lab', 'work', 'live', 'contact']

function parseHash(): View {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '') as View
  return VIEWS.includes(h) ? h : 'home'
}

interface ViewCtx {
  view: View
  setView: (v: View) => void
}

const Ctx = createContext<ViewCtx>({ view: 'home', setView: () => {} })

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>(parseHash())

  useEffect(() => {
    const onHash = () => setViewState(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const setView = (v: View) => {
    if (window.location.hash.replace('#', '') !== v) {
      window.location.hash = v // triggers hashchange → state update + shareable URL
    } else {
      setViewState(v)
    }
  }

  return <Ctx.Provider value={{ view, setView }}>{children}</Ctx.Provider>
}

export const useView = () => useContext(Ctx)
