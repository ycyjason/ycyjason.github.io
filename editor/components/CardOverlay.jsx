// Rendered via the renderOverlay prop the public grids (WorksGrid/ToolsGrid/
// ExperienceList) accept. Cards are wrapped in a <Link>, so the click must be
// stopped before it bubbles into router navigation. `inline` renders as a
// normal-flow element instead of an absolutely-positioned corner badge, for
// spots like Intro's paragraph that have no fixed-size box to pin against.
export default function CardOverlay({ onEdit, inline }) {
  return (
    <button
      type="button"
      className={inline ? 'card-overlay-btn-inline' : 'card-overlay-btn'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onEdit()
      }}
    >
      edit
    </button>
  )
}
