import RowActions from './RowActions'
import { swap } from '../lib/swap'

const newId = () => `link-${crypto.randomUUID().slice(0, 8)}`

// Rail renders these in array order, so move up/down here sets the nav order.
export default function ExternalLinksEditor({ links, onChange }) {
  const patch = (id, key, value) =>
    onChange(links.map((link) => (link.id === id ? { ...link, [key]: value } : link)))

  const remove = (id) => onChange(links.filter((link) => link.id !== id))

  const add = () => onChange([...links, { id: newId(), label: '', href: '' }])

  return (
    <div className="editor-field">
      <span className="field-label">External links</span>

      {links.map((link, index) => (
        <div className="builder-block" key={link.id}>
          <div className="flex items-center gap-1">
            <input
              className="editor-input"
              style={{ flex: 1, minWidth: 0 }}
              aria-label="link label"
              placeholder="label"
              value={link.label}
              onChange={(e) => patch(link.id, 'label', e.target.value)}
            />
            <RowActions
              index={index}
              length={links.length}
              removeLabel={`remove ${link.label || 'link'}`}
              onMove={(delta) => onChange(swap(links, index, delta))}
              onRemove={() => remove(link.id)}
            />
          </div>
          <input
            className="editor-input"
            aria-label="link url"
            placeholder="https://... or mailto:..."
            value={link.href}
            onChange={(e) => patch(link.id, 'href', e.target.value)}
          />
        </div>
      ))}

      <button type="button" className="editor-btn" onClick={add}>
        + add link
      </button>
    </div>
  )
}
