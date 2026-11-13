import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation the way a full
// page load does. Jump to top on every route change, except when the target
// has a hash (Landing's own effect scrolls to that section instead).
export default function ScrollRestoration() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    // instant, not smooth: this is a page transition, not a user-initiated
    // scroll, and the global smooth-scroll behavior would otherwise animate it
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
