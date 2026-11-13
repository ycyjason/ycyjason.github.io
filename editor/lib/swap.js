// Returns a copy of `list` with the item at `index` swapped with its neighbour
// `delta` positions away. Callers guard the bounds (the move buttons disable at the ends).
export const swap = (list, index, delta) => {
  const next = [...list]
  ;[next[index], next[index + delta]] = [next[index + delta], next[index]]
  return next
}
