import { UploadControls, useUpload } from './UploadControls'

// Path text stays editable so an already-uploaded image can be repointed or
// typed in by hand; the button is just the convenient route.
export default function ImageField({ label, value, onChange, dir }) {
  const { busy, error, upload } = useUpload(dir, onChange)

  return (
    <div className="editor-field">
      {label && <span className="field-label">{label}</span>}
      <input
        className="editor-input"
        aria-label={label || 'image path'}
        placeholder="media/works/shot.webp"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      <UploadControls noun="image" busy={busy} upload={upload} hasValue={!!value} onClear={() => onChange('')} />
      {error && <span className="field-label upload-error">{error}</span>}
    </div>
  )
}
