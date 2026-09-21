import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../../lib/ContentContext'
import ThemeToggle from '../ui/ThemeToggle'

const SECTIONS = [
  { id: 'work', label: 'works' },
  { id: 'tools', label: 'tools' },
  { id: 'experience', label: 'experience' },
]

export default function Rail() {
  const { name, externalLinks } = useSite()
  const [hidden, setHidden] = useState(false)
  const [linksOpen, setLinksOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const dy = y - lastY.current
      if (Math.abs(dy) < 6) return
      const hide = dy > 0 && y > 80
      setHidden(hide)
      if (hide) setLinksOpen(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!linksOpen) return
    const close = () => setLinksOpen(false)
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('click', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [linksOpen])

  return (
    <header className={`rail${hidden ? ' hide' : ''}${linksOpen ? ' links-open' : ''}`}>
      <Link className="ident" to="/" aria-label={`${name}, back to landing`}>
        <span className="name">{name}</span>
      </Link>

      <div className="navs">
        <nav className="nav" aria-label="Sections">
          {SECTIONS.map((s) => (
            <Link key={s.id} to={`/#${s.id}`}>
              {s.label}
            </Link>
          ))}
        </nav>
        <nav className="nav nav-ext" id="ext-links" aria-label="Elsewhere">
          {externalLinks.map((link) => (
            <a
              key={link.id ?? link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="railfoot">
        <button
          className="tbtn links-btn"
          aria-label="External links"
          title="External links"
          aria-expanded={linksOpen}
          aria-controls="ext-links"
          onClick={(e) => {
            e.stopPropagation()
            setLinksOpen((open) => !open)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
