import ImageField from './ImageField'
import VideoField from './VideoField'

const newId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`

// Ids are only ever compared inside the one array they live in, so 8 hex chars
// is ample. They exist to keep React keys stable while rows are reordered or
// retyped, which index keys cannot do.
const BLOCK_KINDS = [
  { type: 'heading', label: '+ subheading' },
  { type: 'paragraph', label: '+ paragraph' },
  { type: 'image', label: '+ image' },
  { type: 'video', label: '+ video' },
]

const createBlock = (type) => {
  if (type === 'image') return { id: newId('blk'), type, src: '', caption: '' }
  if (type === 'video') return { id: newId('blk'), type, src: '', mode: 'click-to-play', caption: '' }
  return { id: newId('blk'), type, text: '' }
}

const swap = (list, index, delta) => {
  const next = [...list]
  ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
  return next
}

function RowActions({ index, length, onMove, onRemove, removeLabel }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="builder-icon-btn"
        aria-label="move up"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        &uarr;
      </button>
      <button
        type="button"
        className="builder-icon-btn"
        aria-label="move down"
        disabled={index === length - 1}
        onClick={() => onMove(1)}
      >
        &darr;
      </button>
      <button type="button" className="builder-icon-btn" aria-label={removeLabel} onClick={onRemove}>
        &times;
      </button>
    </div>
  )
}

// onChange here emits a small { field: value } patch rather than a fully
// merged block, so the caller can apply it against whichever block is
// current when it runs — the image field resolves after an async gap, during
// which the caption (or anything else) may have already changed.
function BlockFields({ block, onChange, dir }) {
  if (block.type === 'image') {
    return (
      <>
        <ImageField value={block.src} dir={dir} onChange={(src) => onChange({ src })} />
        <input
          className="editor-input"
          placeholder="caption (optional)"
          value={block.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value })}
        />
      </>
    )
  }

  if (block.type === 'video') {
    return (
      <>
        <VideoField
          value={block.src}
          mode={block.mode}
          dir={dir}
          onChangeSrc={(src) => onChange({ src })}
          onChangeMode={(mode) => onChange({ mode })}
        />
        <input
          className="editor-input"
          placeholder="caption (optional)"
          value={block.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value })}
        />
      </>
    )
  }

  if (block.type === 'heading') {
    return (
      <input
        className="editor-input"
        placeholder="subheading"
        value={block.text ?? ''}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    )
  }

  return (
    <textarea
      className="editor-textarea"
      rows={4}
      placeholder="paragraph"
      value={block.text ?? ''}
      onChange={(e) => onChange({ text: e.target.value })}
    />
  )
}

export default function SectionsBuilder({ sections, onChange, dir }) {
  // onChange always receives an updater `(prevSections) => next`, so a
  // pending image upload's eventual patch merges onto whatever sections are
  // current when it resolves, not the array snapshot from when it started.
  const patchSection = (id, patch) =>
    onChange((prevSections) =>
      prevSections.map((section) =>
        section.id === id
          ? { ...section, ...(typeof patch === 'function' ? patch(section) : patch) }
          : section,
      ),
    )

  const setBlocks = (sectionId, updateBlocks) =>
    patchSection(sectionId, (prevSection) => ({ blocks: updateBlocks(prevSection.blocks ?? []) }))

  return (
    <div className="builder-sections">
      <span className="field-label">Sections</span>

      {sections.map((section, sectionIndex) => {
        const blocks = section.blocks ?? []

        return (
          <div className="builder-section" key={section.id}>
            <div className="flex items-center gap-1">
              <input
                className="editor-input"
                style={{ flex: 1, minWidth: 0 }}
                placeholder="section label (optional)"
                value={section.label ?? ''}
                onChange={(e) => patchSection(section.id, { label: e.target.value })}
              />
              <RowActions
                index={sectionIndex}
                length={sections.length}
                removeLabel="remove section"
                onMove={(delta) => onChange((prev) => swap(prev, sectionIndex, delta))}
                onRemove={() => onChange((prev) => prev.filter((s) => s.id !== section.id))}
              />
            </div>

            {blocks.map((block, blockIndex) => (
              <div className="builder-block" key={block.id}>
                <div className="flex items-center justify-between gap-1">
                  <span className="field-label">
                    {block.type === 'heading' ? 'subheading' : block.type}
                  </span>
                  <RowActions
                    index={blockIndex}
                    length={blocks.length}
                    removeLabel={`remove ${block.type}`}
                    onMove={(delta) =>
                      setBlocks(section.id, (prev) => swap(prev, blockIndex, delta))
                    }
                    onRemove={() =>
                      setBlocks(section.id, (prev) => prev.filter((b) => b.id !== block.id))
                    }
                  />
                </div>
                <BlockFields
                  block={block}
                  dir={dir}
                  onChange={(patch) =>
                    setBlocks(section.id, (prev) =>
                      prev.map((b) => (b.id === block.id ? { ...b, ...patch } : b)),
                    )
                  }
                />
              </div>
            ))}

            <div className="flex flex-wrap gap-1">
              {BLOCK_KINDS.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  className="editor-btn"
                  onClick={() => setBlocks(section.id, (prev) => [...prev, createBlock(type)])}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <button
        type="button"
        className="editor-btn is-active"
        onClick={() =>
          onChange((prev) => [...prev, { id: newId('sec'), label: '', blocks: [] }])
        }
      >
        + add section
      </button>
    </div>
  )
}
