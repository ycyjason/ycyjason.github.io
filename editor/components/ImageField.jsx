import { UploadControls } from './UploadControls'

// Path text stays editable so an already-uploaded image can be repointed or
// typed in by hand; the button is just the convenient route.
export default function ImageField({ label, value, onChange, dir }) {
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
      <UploadControls kind="image" dir={dir} value={value} onChange={onChange} />
    </div>
  )
}
