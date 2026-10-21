import { useState } from 'react'
import { uploadFile } from '../lib/api'

// Shared by ImageField and VideoField: tracks the in-flight/error state of an
// upload into `dir` and hands the stored path to `onUploaded`.
export function useUpload(dir, onUploaded) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onUploaded(await uploadFile(file, dir))
    } catch (err) {
      setError(String(err.message ?? err))
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, upload }
}

// `noun` is "image" or "video": it labels the button and sets the file filter.
export function UploadControls({ noun, busy, upload, hasValue, onClear }) {
  return (
    <div className="flex items-center gap-2">
      <label className="editor-btn file-btn">
        {busy ? 'uploading…' : `upload ${noun}`}
        <input
          type="file"
          accept={`${noun}/*`}
          hidden
          disabled={busy}
          onChange={(e) => {
            upload(e.target.files?.[0])
            e.target.value = '' // so picking the same file again still fires
          }}
        />
      </label>
      {hasValue && (
        <button type="button" className="editor-btn" onClick={onClear}>
          clear
        </button>
      )}
    </div>
  )
}
