import { useState } from 'react'
import { uploadFile } from '../lib/api'

// Path text stays editable so an already-uploaded image can be repointed or
// typed in by hand; the button is just the convenient route.
export default function ImageField({ label, value, onChange, dir }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadFile(file, dir))
    } catch (err) {
      setError(String(err.message ?? err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor-field">
      {label && <span className="field-label">{label}</span>}
      <input
        className="editor-input"
        placeholder="media/works/shot.webp"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="editor-btn file-btn">
          {busy ? 'uploading…' : 'upload image'}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files?.[0])
              e.target.value = '' // so picking the same file again still fires
            }}
          />
        </label>
        {value && (
          <button type="button" className="editor-btn" onClick={() => onChange('')}>
            clear
          </button>
        )}
      </div>
      {error && <span className="field-label upload-error">{error}</span>}
    </div>
  )
}
