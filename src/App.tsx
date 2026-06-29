import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { ModeProvider } from './lib/mode'
import { MotionRoot } from './lib/motion'
import Background from './components/Background'
import StatusBar from './components/StatusBar'
import CommandMenu from './components/CommandMenu'
import Hero from './components/Hero'
import Alpharooms from './components/Alpharooms'
import ScrollShowcase from './components/ScrollShowcase'
import ThroughputLab from './components/ThroughputLab'
import SkillsMatrix from './components/SkillsMatrix'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  useEffect(() => {
    const t = setTimeout(
      () => toast('Tip — press ⌘K', { description: 'open the command palette', duration: 5000 }),
      2800,
    )
    return () => clearTimeout(t)
  }, [])

  return (
    <ModeProvider>
      <MotionRoot>
        <div className="grain scanlines relative min-h-screen text-[var(--text)]">
          <Background />
          <StatusBar />
          <CommandMenu />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--panel)',
                border: '1px solid var(--line-strong)',
                color: 'var(--text)',
              },
            }}
          />

          {/* offset for the fixed header (control row + ticker) */}
          <main className="relative z-10 pt-[4.75rem]">
            <Hero />
            <Alpharooms />
            <ScrollShowcase />
            <ThroughputLab />
            <SkillsMatrix />
            <Experience />
            <Contact />
          </main>

          <Footer />
        </div>
      </MotionRoot>
    </ModeProvider>
  )
}
