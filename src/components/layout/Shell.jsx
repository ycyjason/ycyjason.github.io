import Rail from './Rail'

export default function Shell({ children }) {
  return (
    <div className="shell">
      <Rail />
      <main>{children}</main>
    </div>
  )
}
