import { Link } from 'react-router-dom'
import { useTools } from '../../lib/ContentContext'

// renderOverlay/renderAddAffordance/onItemClick are optional editor-only
// hooks (undefined on the public site, so the Link navigates normally there).
export default function ToolsGrid({ renderOverlay, renderAddAffordance, onItemClick }) {
  const tools = useTools()

  return (
    <section className="section inner" id="tools">
      <span className="section-label eyebrow">tools</span>
      <div className="grid">
        {tools.map((item) => (
          <Link
            key={item.id}
            className="panel"
            to={`/tools/${item.slug}`}
            onClick={
              onItemClick &&
              ((e) => {
                e.preventDefault()
                onItemClick(item)
              })
            }
          >
            <div className="body">
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
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
