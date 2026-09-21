import SaveButton from './SaveButton'
import SectionsBuilder from './SectionsBuilder'
import TagInput from './TagInput'

export default function DetailDrawer({ item, onChange, onBack, onSave, status, dir }) {
  // Merges against whatever item is current when this runs, not the `item`
  // prop closed over at render time. `value` may itself be an updater
  // `(prevFieldValue) => next` — SectionsBuilder uses that form for
  // `sections`, since image uploads inside it resolve after an async gap.
  const update = (key, value) =>
    onChange((prevItem) => ({
      ...prevItem,
      [key]: typeof value === 'function' ? value(prevItem[key]) : value,
    }))

  return (
    <aside className="settings-drawer is-wide flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="field-label">detail page</span>
        <div className="flex items-center gap-2">
          <SaveButton onSave={onSave} status={status} />
          <button
            type="button"
            className="tbtn"
            aria-label="back to grid"
            title="back to grid"
            onClick={onBack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <label className="editor-field">
        <span className="field-label">Meta info (optional) — duration, role, etc.</span>
        <TagInput value={item.meta ?? []} onChange={(meta) => update('meta', meta)} />
      </label>

      <label className="editor-field">
        <span className="field-label">Lead paragraph (optional)</span>
        <textarea
          className="editor-textarea"
          rows={5}
          value={item.lead ?? ''}
          onChange={(e) => update('lead', e.target.value)}
        />
      </label>

      <label className="editor-field">
        <span className="field-label">Link URL (optional)</span>
        <input
          className="editor-input"
          placeholder="https://..."
          value={item.linkUrl ?? ''}
          onChange={(e) => update('linkUrl', e.target.value)}
        />
      </label>

      <label className="editor-field">
        <span className="field-label">Link button text</span>
        <input
          className="editor-input"
          placeholder="open link"
          value={item.linkLabel ?? ''}
          onChange={(e) => update('linkLabel', e.target.value)}
        />
      </label>

      <SectionsBuilder
        sections={item.sections ?? []}
        dir={dir}
        onChange={(sections) => update('sections', sections)}
      />
    </aside>
  )
}
