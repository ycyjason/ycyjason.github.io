import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../../lib/ContentContext'
import { assetUrl } from '../../lib/assetUrl'

const BULLET = /^\s*[-*•]\s+(.*)$/

// Plain text with two conventions: a blank line starts a new paragraph, and a
// line beginning with "- ", "* " or a bullet char becomes a list item. Text
// with neither renders as a single <p>, exactly as before.
function RichText({ text }) {
  const nodes = []
  let paragraph = []
  let list = []

  const flush = () => {
    if (paragraph.length) nodes.push(<p key={nodes.length}>{paragraph.join('\n')}</p>)
    if (list.length) {
      nodes.push(
        <ul key={nodes.length}>
          {list.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>,
      )
    }
    paragraph = []
    list = []
  }

  for (const line of (text ?? '').split('\n')) {
    const bullet = line.match(BULLET)
    if (bullet) {
      if (paragraph.length) flush()
      list.push(bullet[1])
    } else if (!line.trim()) {
      flush()
    } else {
      if (list.length) flush()
      paragraph.push(line)
    }
  }
  flush()

  return nodes
}

// Sections hold a flat, freely-ordered list of blocks, so a section can be any
// mix of subheadings, paragraphs and images in any order.
function Block({ block }) {
  if (block.type === 'heading') return <h3 className="eyebrow">{block.text}</h3>

  if (block.type === 'image') {
    return (
      <figure className="figure">
        {block.src ? (
          <img src={assetUrl(block.src)} alt={block.caption ?? ''} />
        ) : (
          <span className="shot is-empty" aria-hidden="true">
            <span className="eyebrow">image placeholder</span>
          </span>
        )}
        {block.caption && <figcaption className="eyebrow">{block.caption}</figcaption>}
      </figure>
    )
  }

  if (block.type === 'video') {
    // autoplay-loop is the silent ambient background pattern, so it skips
    // native controls; the other two modes are meant to be watched, so the
    // viewer gets controls to pause, seek, or rewatch.
    const isLoop = block.mode === 'autoplay-loop'
    const isAutoplay = isLoop || block.mode === 'autoplay-once'

    return (
      <figure className="figure">
        {block.src ? (
          <video
            src={assetUrl(block.src)}
            autoPlay={isAutoplay}
            muted={isAutoplay}
            loop={isLoop}
            controls={!isLoop}
            playsInline
          />
        ) : (
          <span className="shot is-empty" aria-hidden="true">
            <span className="eyebrow">video placeholder</span>
          </span>
        )}
        {block.caption && <figcaption className="eyebrow">{block.caption}</figcaption>}
      </figure>
    )
  }

  if (block.type === 'metrics') {
    const items = (block.items ?? []).filter((m) => m.label || m.text)
    if (!items.length) return null
    return (
      <dl className="metrics">
        {items.map((m) => (
          <div className="metric" key={m.id}>
            <dt className="eyebrow">{m.label}</dt>
            <dd>{m.text}</dd>
          </div>
        ))}
      </dl>
    )
  }

  if (block.type === 'table') {
    const items = (block.items ?? []).filter((r) => r.label || r.text)
    if (!items.length) return null
    return (
      <dl className="spec-table">
        {items.map((r) => (
          <div className="spec-row" key={r.id}>
            <dt>{r.label}</dt>
            <dd>
              <RichText text={r.text} />
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  if (block.type === 'code') {
    return (
      <pre className="code-block">
        <code>{block.text}</code>
      </pre>
    )
  }

  return <RichText text={block.text} />
}

// company and date are their own fields (also shown on the card); meta is free-form extra
// info — duration, role, anything — author-ordered and detail-page-only.
const SEPARATOR = ' ▪ '

export default function DetailBody({ item }) {
  const { name } = useSite()
  const metaLine = [item.company, item.date, ...(item.meta ?? [])].filter(Boolean).join(SEPARATOR)
  const [footerVisible, setFooterVisible] = useState(false)
  const footRef = useRef(null)

  useEffect(() => {
    const el = footRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          setFooterVisible(true)
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <article className="inner doc">
      <header className="doc-head">
        <h1>{item.title}</h1>
        {metaLine && <span className="cell eyebrow">{metaLine}</span>}
        {item.tags?.length > 0 && (
          <div className="foot">
            {item.tags.map((tag) => (
              <span className="chip eyebrow" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {item.lead && <p className="lead">{item.lead}</p>}
        {item.linkUrl && (
          <div className="cta">
            <a href={item.linkUrl} target="_blank" rel="noopener">
              {item.linkLabel || 'open link'}
            </a>
          </div>
        )}
      </header>

      {(item.sections ?? []).map((section) => (
        <section className="block" key={section.id}>
          {section.label && <h2 className="section-label eyebrow">{section.label}</h2>}
          {(section.blocks ?? []).map((block) => (
            <Block key={block.id} block={block} />
          ))}
        </section>
      ))}

      <div ref={footRef} className={`doc-foot${footerVisible ? ' in' : ''}`}>
        <Link className="back eyebrow" to="/">
          {name} / home
        </Link>
      </div>
    </article>
  )
}
