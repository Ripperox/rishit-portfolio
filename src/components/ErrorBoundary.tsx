import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

/* Contains a crashing view so the shell/nav stays usable instead of white-screening.
   Key it by view so navigating away resets it. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    // surfaced in the console for debugging; never bubbles to crash the app
    console.error('[view error]', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-24 text-center">
          <span className="grid h-12 w-12 place-items-center border border-[var(--line)] text-[var(--red)]">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h2 className="font-display text-lg font-semibold text-zinc-200">This view hit a snag</h2>
          <p className="text-[13px] text-zinc-500">
            Something in this section errored. The rest of the site is fine — pick another view, or retry.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-1 border border-accent px-4 py-2 text-[12px] text-accent transition-all hover:glow-accent"
          >
            ↻ retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
