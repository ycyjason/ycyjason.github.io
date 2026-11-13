// Saves every content type at once, so it reads the same from any drawer.
// Returns a fragment; the caller supplies the flex row it sits in.
export default function SaveButton({ onSave, status }) {
  return (
    <>
      {status && <span className="field-label">{status}</span>}
      <button type="button" className="tbtn" aria-label="save" title="save" onClick={onSave}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      </button>
    </>
  )
}
