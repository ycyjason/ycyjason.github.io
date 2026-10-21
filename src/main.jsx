import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// The browser's own restore waits for content, then jumps down just before
// ScrollRestoration snaps back to top. Opt out so a refresh always starts at
// the top and scroll position is decided in one place.
history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
