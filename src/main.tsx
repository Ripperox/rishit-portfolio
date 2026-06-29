import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// NOTE: StrictMode is intentionally omitted. Its dev-only double mount/unmount
// breaks GSAP SplitText (nested splits freeze mid-tween) and needlessly
// re-creates the OGL/WebGL chart contexts. Production renders once regardless.
createRoot(document.getElementById('root')!).render(<App />)
