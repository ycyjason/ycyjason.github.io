export default function AddAffordance({ onClick, label, compact }) {
  return (
    <button
      type="button"
      className={compact ? 'add-affordance-compact' : 'add-affordance'}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
