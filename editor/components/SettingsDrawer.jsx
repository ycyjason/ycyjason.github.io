import ExternalLinksEditor from './ExternalLinksEditor'
import ImageField from './ImageField'
import SaveButton from './SaveButton'
import TagInput from './TagInput'

// Card-level fields only. Detail-level fields live in DetailDrawer, reached by
// clicking the card itself in the preview.
export default function SettingsDrawer({ kind, item, onChange, onDelete, onClose, onSave, status }) {
  // Merges against whatever item is current when this runs, not the `item`
  // prop closed over at render time — matters for the cover upload, which
  // resolves after an async gap during which other fields may have changed.
  const update = (key, value) => onChange((prevItem) => ({ ...prevItem, [key]: value }))

  return (
    <aside className="settings-drawer flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="field-label">{kind}</span>
        <div className="flex items-center gap-2">
          <SaveButton onSave={onSave} status={status} />
          <button type="button" className="tbtn" aria-label="close" title="close" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {kind === 'site' ? (
        <>
          <label className="editor-field">
            <span className="field-label">Introduction paragraph</span>
            <textarea
              className="editor-textarea"
              rows={6}
              value={item.intro}
              onChange={(e) => update('intro', e.target.value)}
            />
          </label>
          <ExternalLinksEditor
            links={item.externalLinks ?? []}
            onChange={(externalLinks) => update('externalLinks', externalLinks)}
          />
        </>
      ) : kind === 'experience' ? (
        <>
          <label className="editor-field">
            <span className="field-label">Range (optional)</span>
            <input
              className="editor-input"
              value={item.range}
              onChange={(e) => update('range', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Company</span>
            <input
              className="editor-input"
              value={item.company}
              onChange={(e) => update('company', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Description (optional, start a line with - for a bullet)</span>
            <textarea
              className="editor-textarea"
              rows={5}
              value={item.description ?? ''}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>
        </>
      ) : (
        <>
          <label className="editor-field">
            <span className="field-label">Title</span>
            <input
              className="editor-input"
              value={item.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Slug (URL path)</span>
            <input
              className="editor-input"
              value={item.slug}
              onChange={(e) => update('slug', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Company (optional)</span>
            <input
              className="editor-input"
              value={item.company ?? ''}
              onChange={(e) => update('company', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Date (optional)</span>
            <input
              className="editor-input"
              value={item.date}
              onChange={(e) => update('date', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Summary</span>
            <textarea
              className="editor-textarea"
              rows={3}
              value={item.summary}
              onChange={(e) => update('summary', e.target.value)}
            />
          </label>
          <label className="editor-field">
            <span className="field-label">Tags</span>
            <TagInput value={item.tags ?? []} onChange={(tags) => update('tags', tags)} />
          </label>
          {/* only works render a cover; tools cards are text-only */}
          {kind === 'work' && (
            <ImageField
              label="Cover image"
              value={item.cover}
              dir={`works/${item.slug}`}
              onChange={(cover) => update('cover', cover)}
            />
          )}
        </>
      )}

      {kind !== 'site' && (
        <button type="button" className="editor-btn" onClick={onDelete}>
          delete {kind}
        </button>
      )}
    </aside>
  )
}
