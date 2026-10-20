import Rail from './Rail'

export default function Shell({ children }) {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Rail />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
