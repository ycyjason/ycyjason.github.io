import { useState } from 'react'
import { uploadFile } from '../lib/api'

const MODES = [
  { value: 'click-to-play', label: 'click to play' },
  { value: 'autoplay-loop', label: 'autoplay, loop (muted)' },
  { value: 'autoplay-once', label: 'autoplay once (muted)' },
]

// Mirrors ImageField's shape (path input + upload button + clear), plus a
// play-mode select, since that's a per-video authoring choice rather than
// something the viewer controls.
export default function VideoField({ value, mode, onChangeSrc, onChangeMode, dir }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChangeSrc(await uploadFile(file, dir))
    } catch (err) {
      setError(String(err.message ?? err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor-field">
      <input
        className="editor-input"
        aria-label="video path"
        placeholder="media/works/clip.mp4"
        value={value ?? ''}
        onChange={(e) => onChangeSrc(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="editor-btn file-btn">
          {busy ? 'uploading…' : 'upload video'}
          <input
            type="file"
            accept="video/*"
            hidden
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
        {value && (
          <button type="button" className="editor-btn" onClick={() => onChangeSrc('')}>
            clear
          </button>
        )}
      </div>
      <select
        className="editor-input"
        aria-label="playback mode"
        value={mode ?? 'click-to-play'}
        onChange={(e) => onChangeMode(e.target.value)}
      >
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      {error && <span className="field-label upload-error">{error}</span>}
    </div>
  )
}
