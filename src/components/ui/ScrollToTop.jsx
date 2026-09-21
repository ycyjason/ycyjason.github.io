import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const onScroll = () => setOn(window.scrollY > 160)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      className={`totop${on ? ' on' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!on}
      tabIndex={on ? 0 : -1}
    >
      <span aria-hidden="true">&#8593;</span>
    </button>
  )
}
