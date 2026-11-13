const BULLET = /^\s*[-*•]\s+(.*)$/

// Plain text with two conventions: a blank line starts a new paragraph, and a
// line beginning with "- ", "* " or a bullet char becomes a list item. Text
// with neither renders as a single <p>, exactly as before.
export default function RichText({ text }) {
  const nodes = []
  let paragraph = []
  let list = []

  const flush = () => {
    if (paragraph.length) nodes.push(<p key={nodes.length}>{paragraph.join('\n')}</p>)
    if (list.length) {
      nodes.push(
        <ul key={nodes.length}>
          {list.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>,
      )
    }
    paragraph = []
    list = []
  }

  for (const line of (text ?? '').split('\n')) {
    const bullet = line.match(BULLET)
    if (bullet) {
      if (paragraph.length) flush()
      list.push(bullet[1])
    } else if (!line.trim()) {
      flush()
    } else {
      if (list.length) flush()
      paragraph.push(line)
    }
  }
  flush()

  return nodes
}
