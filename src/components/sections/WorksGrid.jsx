import { Link } from 'react-router-dom'
import { useWorks } from '../../lib/ContentContext'
import Cover from '../ui/Cover'

// renderOverlay/renderAddAffordance/onItemClick are optional editor-only
// hooks (undefined on the public site, so the Link navigates normally there).
export default function WorksGrid({ renderOverlay, renderAddAffordance, onItemClick }) {
  const works = useWorks()

  return (
    <section className="section inner" id="work">
      <span className="section-label eyebrow">works</span>
      <div className="grid">
        {works.map((item) => (
          <Link
            key={item.id}
            className="panel"
            to={`/work/${item.slug}`}
            onClick={
              onItemClick &&
              ((e) => {
                e.preventDefault()
                onItemClick(item)
              })
            }
          >
            <Cover src={item.cover} />
            <div className="body">
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              {item.date && <span className="cell started eyebrow">{item.date}</span>}
              {item.tags?.length > 0 && (
                <div className="foot">
                  {item.tags.map((tag) => (
                    <span className="chip eyebrow" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {renderOverlay?.(item)}
          </Link>
        ))}
        {renderAddAffordance?.()}
      </div>
    </section>
  )
}
