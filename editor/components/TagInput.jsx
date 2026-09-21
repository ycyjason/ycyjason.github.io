import { useState } from 'react'

export default function TagInput({ value, onChange }) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  const remove = (tag) => onChange(value.filter((t) => t !== tag))

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map((tag) => (
        <span key={tag} className="chip eyebrow flex items-center gap-1">
          {tag}
          <button type="button" aria-label={`remove ${tag}`} onClick={() => remove(tag)}>
            &times;
          </button>
        </span>
      ))}
      <input
        className="editor-input"
        style={{ width: '140px' }}
        placeholder="add tag, enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          commit()
        }}
        onBlur={commit}
      />
    </div>
  )
}
