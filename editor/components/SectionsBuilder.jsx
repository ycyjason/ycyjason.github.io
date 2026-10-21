import ImageField from './ImageField'
import VideoField from './VideoField'
import RowActions from './RowActions'
import { swap } from '../lib/swap'

const newId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`

// Ids are only ever compared inside the one array they live in, so 8 hex chars
// is ample. They exist to keep React keys stable while rows are reordered or
// retyped, which index keys cannot do.
const BLOCK_KINDS = [
  { type: 'heading', label: '+ subheading' },
  { type: 'paragraph', label: '+ paragraph' },
  { type: 'image', label: '+ image' },
  { type: 'video', label: '+ video' },
  { type: 'code', label: '+ code' },
  { type: 'metrics', label: '+ metrics' },
  { type: 'table', label: '+ table' },
]

// metrics and table share one shape: a list of label + text pairs
const createPair = () => ({ id: newId('row'), label: '', text: '' })

const PAIR_COPY = {
  metrics: {
    labelHint: 'metric, e.g. conversion rate',
    textHint: 'result, e.g. increase by 12%',
    textRows: 2,
    addLabel: '+ metric',
    removeLabel: 'remove metric',
  },
  table: {
    labelHint: 'heading',
    textHint: 'paragraph (start a line with - for a bullet)',
    textRows: 3,
    addLabel: '+ row',
    removeLabel: 'remove row',
  },
}

const createBlock = (type) => {
  if (type === 'image') return { id: newId('blk'), type, src: '', caption: '' }
  if (type === 'video') return { id: newId('blk'), type, src: '', mode: 'click-to-play', caption: '' }
  if (type === 'code') return { id: newId('blk'), type, text: '' }
  if (type in PAIR_COPY) return { id: newId('blk'), type, items: [createPair()] }
  return { id: newId('blk'), type, text: '' }
}

function PairFields({ items, onChange, copy }) {
  const patchItem = (id, patch) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))

  return (
    <>
      {items.map((item, index) => (
        <div className="flex items-start gap-1" key={item.id}>
          <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
            <input
              className="editor-input"
              placeholder={copy.labelHint}
              value={item.label ?? ''}
              onChange={(e) => patchItem(item.id, { label: e.target.value })}
            />
            <textarea
              className="editor-textarea"
              rows={copy.textRows}
              placeholder={copy.textHint}
              value={item.text ?? ''}
              onChange={(e) => patchItem(item.id, { text: e.target.value })}
            />
          </div>
          <RowActions
            index={index}
            length={items.length}
            removeLabel={copy.removeLabel}
            onMove={(delta) => onChange(swap(items, index, delta))}
            onRemove={() => onChange(items.filter((x) => x.id !== item.id))}
          />
        </div>
      ))}
      <div>
        <button
          type="button"
          className="editor-btn"
          onClick={() => onChange([...items, createPair()])}
        >
          {copy.addLabel}
        </button>
      </div>
    </>
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

  if (block.type in PAIR_COPY) {
    return (
      <PairFields
        items={block.items ?? []}
        onChange={(items) => onChange({ items })}
        copy={PAIR_COPY[block.type]}
      />
    )
  }

  if (block.type === 'code') {
    return (
      <textarea
        className="editor-textarea editor-textarea-code"
        rows={8}
        placeholder="prompt or code snippet"
        spellCheck={false}
        value={block.text ?? ''}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    )
  }

  return (
    <textarea
      className="editor-textarea"
      rows={4}
      placeholder="paragraph (start a line with - for a bullet)"
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
