// Empty-state box for an image or video that has no source yet. Decorative,
// so it is hidden from assistive tech like the media it stands in for.
export default function Placeholder({ label = 'image placeholder' }) {
  return (
    <span className="shot is-empty" aria-hidden="true">
      <span className="eyebrow">{label}</span>
    </span>
  )
}
