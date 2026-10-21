import { useSite } from '../../lib/ContentContext'

// renderOverlay is an optional editor-only hook (undefined on the public
// site, so nothing extra renders there).
export default function Intro({ renderOverlay }) {
  const { name, headline, intro } = useSite()

  return (
    <section className="intro inner" id="about">
      <h1 className="sr-only">{name}</h1>
      {headline && <p className="intro-headline">{headline}</p>}
      <p>{intro}</p>
      {renderOverlay?.()}
    </section>
  )
}
