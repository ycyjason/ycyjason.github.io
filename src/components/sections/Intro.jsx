import { useSite } from '../../lib/ContentContext'

// renderOverlay is an optional editor-only hook (undefined on the public
// site, so nothing extra renders there).
export default function Intro({ renderOverlay }) {
  const { intro } = useSite()

  return (
    <section className="intro inner" id="about">
      <p className="reveal">{intro}</p>
      {renderOverlay?.()}
    </section>
  )
}
