const newId = () => `link-${crypto.randomUUID().slice(0, 8)}`

// No reorder — Rail renders these in array order and nothing has asked for
// drag/move here, so add/remove/edit is the whole surface.
export default function ExternalLinksEditor({ links, onChange }) {
  const patch = (id, key, value) =>
    onChange(links.map((link) => (link.id === id ? { ...link, [key]: value } : link)))

  const remove = (id) => onChange(links.filter((link) => link.id !== id))

  const add = () => onChange([...links, { id: newId(), label: '', href: '' }])

  return (
    <div className="editor-field">
      <span className="field-label">External links</span>

      {links.map((link) => (
        <div className="builder-block" key={link.id}>
          <div className="flex items-center gap-1">
            <input
              className="editor-input"
              style={{ flex: 1, minWidth: 0 }}
              placeholder="label"
              value={link.label}
              onChange={(e) => patch(link.id, 'label', e.target.value)}
            />
            <button
              type="button"
              className="builder-icon-btn"
              aria-label={`remove ${link.label || 'link'}`}
              onClick={() => remove(link.id)}
            >
              &times;
            </button>
          </div>
          <input
            className="editor-input"
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
