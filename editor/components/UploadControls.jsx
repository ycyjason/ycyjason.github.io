import { useState } from 'react'
import { uploadFile } from '../lib/api'

// Shared by ImageField and VideoField: upload button, clear button and error
// line for a path field. Uploads into `dir` and hands the stored path to
// `onChange`. `kind` is "image" or "video": it labels the button and sets the
// file filter.
export function UploadControls({ kind, dir, value, onChange }) {
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
    <>
      <div className="flex items-center gap-2">
        <label className="editor-btn file-btn">
          {busy ? 'uploading…' : `upload ${kind}`}
          <input
            type="file"
            accept={`${kind}/*`}
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
    </>
  )
}
