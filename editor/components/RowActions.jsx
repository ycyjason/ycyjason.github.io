export default function RowActions({ index, length, onMove, onRemove, removeLabel }) {
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
