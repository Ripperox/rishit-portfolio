import { useEffect, useRef } from 'react'
import { Toaster, toast } from 'sonner'
import { ModeProvider } from './lib/mode'
import { ViewProvider, useView, type View } from './lib/view'
import { MotionRoot, m } from './lib/motion'
import Background from './components/Background'
import TopBar from './components/TopBar'
import { MobileTopBar, MobileBottomNav } from './components/MobileNav'
import { ErrorBoundary } from './components/ErrorBoundary'
import CommandMenu from './components/CommandMenu'
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
    <div className="grain scanlines relative flex h-[100dvh] flex-col overflow-hidden text-[var(--text)]">
      <Background />
      <TopBar />
      <MobileTopBar />

      <main
        ref={mainRef}
        className="relative z-10 flex-1 overflow-y-auto overflow-x-clip pb-16 pt-12 lg:pb-0 lg:pt-0"
      >
        <ErrorBoundary key={view}>
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            {renderView(view)}
          </m.div>
        </ErrorBoundary>
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
