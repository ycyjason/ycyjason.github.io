// Rendered via the renderOverlay prop the public grids (WorksGrid/ToolsGrid/
// ExperienceList) accept. Cards are wrapped in a <Link>, so the click must be
// stopped before it bubbles into router navigation. `inline` renders as a
// normal-flow element instead of an absolutely-positioned corner badge, for
// spots like Intro's paragraph that have no fixed-size box to pin against.
// onMove(delta) reorders the item by one place; the corner badge shows
// earlier/later arrows only when it is provided.
const stop = (fn) => (e) => {
  e.preventDefault()
  e.stopPropagation()
  fn()
}

export default function CardOverlay({ onEdit, onMove, isFirst, isLast, inline }) {
  if (inline) {
    return (
      <button type="button" className="card-overlay-btn-inline" onClick={stop(onEdit)}>
        edit
      </button>
    )
  }

  return (
    <div className="card-overlay">
      {onMove && (
        <>
          <button
            type="button"
            className="card-overlay-btn"
            aria-label="move earlier"
            disabled={isFirst}
            onClick={stop(() => onMove(-1))}
          >
            &larr;
          </button>
          <button
            type="button"
            className="card-overlay-btn"
            aria-label="move later"
            disabled={isLast}
            onClick={stop(() => onMove(1))}
          >
            &rarr;
          </button>
        </>
      )}
      <button type="button" className="card-overlay-btn" onClick={stop(onEdit)}>
        edit
      </button>
    </div>
  )
}
