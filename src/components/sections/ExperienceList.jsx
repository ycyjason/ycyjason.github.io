import { useExperience } from '../../lib/ContentContext'

// renderOverlay/renderAddAffordance are optional editor-only hooks (undefined
// on the public site, so nothing extra renders there).
export default function ExperienceList({ renderOverlay, renderAddAffordance }) {
  const experience = useExperience()

  return (
    <section className="section inner" id="experience">
      <span className="section-label eyebrow">experience</span>
      <div className="exp">
        {experience.map((item) => (
          <div key={item.id} className="exp-item">
            {item.range && <span className="cell eyebrow">{item.range}</span>}
            <h2>{item.company}</h2>
            {renderOverlay?.(item)}
          </div>
        ))}
        {renderAddAffordance?.()}
      </div>
    </section>
  )
}
