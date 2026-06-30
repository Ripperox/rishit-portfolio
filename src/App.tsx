import { useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { ModeProvider } from './lib/mode'
import { ViewProvider, useView, type View } from './lib/view'
import { MotionRoot, m, AnimatePresence } from './lib/motion'
import Background from './components/Background'
import Sidebar from './components/Sidebar'
import { MobileTopBar, MobileBottomNav } from './components/MobileNav'
import CommandMenu from './components/CommandMenu'
import Ticker from './components/Ticker'
import Hero from './components/Hero'
import Alpharooms from './components/Alpharooms'
import ThroughputLab from './components/ThroughputLab'
import SkillsMatrix from './components/SkillsMatrix'
import Experience from './components/Experience'
import LiveSection from './components/LiveSection'
import GitHubActivity from './components/GitHubActivity'
import Contact from './components/Contact'

function renderView(view: View) {
  switch (view) {
    case 'home':
      return <Hero />
    case 'alpharooms':
      return <Alpharooms />
    case 'lab':
      return <ThroughputLab />
    case 'work':
      return (
        <>
          <SkillsMatrix />
          <Experience />
        </>
      )
    case 'live':
      return (
        <>
          <LiveSection />
          <GitHubActivity />
        </>
      )
    case 'contact':
      return <Contact />
    default:
      return <Hero />
  }
}

function Shell() {
  const { view } = useView()
  const mainRef = useRef<HTMLElement>(null)

  // each view starts at the top of the panel
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [view])

  useEffect(() => {
    const t = setTimeout(
      () => toast('Tip — press ⌘K', { description: 'or tap ⌘ to jump between views', duration: 5000 }),
      2800,
    )
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="grain scanlines relative flex h-[100dvh] overflow-hidden text-[var(--text)]">
      <Background />
      <Sidebar />
      <MobileTopBar />

      <main
        ref={mainRef}
        className="relative z-10 flex-1 overflow-y-auto overflow-x-clip pb-16 pt-12 lg:pb-0 lg:pt-0"
      >
        <Ticker className="sticky top-0 z-20 hidden lg:block" />
        <AnimatePresence mode="wait">
          <m.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            {renderView(view)}
          </m.div>
        </AnimatePresence>
      </main>

      <MobileBottomNav />
      <CommandMenu />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: { background: 'var(--panel)', border: '1px solid var(--line-strong)', color: 'var(--text)' },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <ModeProvider>
      <ViewProvider>
        <MotionRoot>
          <Shell />
        </MotionRoot>
      </ViewProvider>
    </ModeProvider>
  )
}
