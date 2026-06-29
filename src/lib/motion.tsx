import { LazyMotion, domMax, m, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'

/* domMax = animations + layout + AnimatePresence (lets us use `layout` on the
   skills/chain grids). Loaded once at the app root via <MotionRoot>. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>
}

const EASE = [0.22, 1, 0.36, 1] as const

/* Drop-in scroll reveal — replaces the hand-rolled IntersectionObserver. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = 'div',
  id,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'section'
  id?: string
}) {
  const Comp: any = as === 'section' ? m.section : m.div
  return (
    <Comp
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

export { m, AnimatePresence }
