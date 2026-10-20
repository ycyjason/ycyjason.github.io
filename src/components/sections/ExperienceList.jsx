import { useExperience } from '../../lib/ContentContext'

// renderOverlay/renderAddAffordance are optional editor-only hooks (undefined
// on the public site, so nothing extra renders there).
export default function ExperienceList({ renderOverlay, renderAddAffordance }) {
  const experience = useExperience()

  return (
    <section className="section inner" id="experience">
      <h2 className="section-label eyebrow">experience</h2>
      <div className="exp">
        {experience.map((item) => (
          <div key={item.id} className="exp-item">
            {item.range && <span className="cell eyebrow">{item.range}</span>}
            <h3>{item.company}</h3>
            {renderOverlay?.(item)}
          </div>
        ))}
        {renderAddAffordance?.()}
      </div>
    </section>
  )
}
