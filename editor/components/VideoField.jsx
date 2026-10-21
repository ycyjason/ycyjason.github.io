import { UploadControls, useUpload } from './UploadControls'
import { youtubeId } from '../../src/lib/youtube'

const MODES = [
  { value: 'click-to-play', label: 'click to play' },
  { value: 'autoplay-loop', label: 'autoplay, loop (muted)' },
  { value: 'autoplay-once', label: 'autoplay once (muted)' },
]

// Mirrors ImageField's shape (path input + upload controls), plus a
// play-mode select, since that's a per-video authoring choice rather than
// something the viewer controls.
export default function VideoField({ value, mode, onChangeSrc, onChangeMode, dir }) {
  const { busy, error, upload } = useUpload(dir, onChangeSrc)

  return (
    <div className="editor-field">
      <input
        className="editor-input"
        aria-label="video path"
        placeholder="media/works/clip.mp4 or a YouTube link"
        value={value ?? ''}
        onChange={(e) => onChangeSrc(e.target.value)}
      />
      <UploadControls noun="video" busy={busy} upload={upload} hasValue={!!value} onClear={() => onChangeSrc('')} />
      {/* play mode only applies to uploaded files; YouTube embeds carry their own player */}
      {!youtubeId(value) && (
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
      )}
      {error && <span className="field-label upload-error">{error}</span>}
    </div>
  )
}
