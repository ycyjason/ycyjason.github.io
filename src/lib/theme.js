import { useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio.theme'

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useTheme() {
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  return [theme, toggle]
}
