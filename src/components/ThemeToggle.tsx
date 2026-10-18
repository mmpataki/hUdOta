import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

function getStoredTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) || 'system'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const cycle = () => {
    setTheme(prev => {
      if (prev === 'system') return 'dark'
      if (prev === 'dark') return 'light'
      return 'system'
    })
  }

  const icon = theme === 'dark' ? '\u{1F319}' : theme === 'light' ? '☀️' : '\u{1F4BB}'
  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'

  return (
    <button className="btn btn-icon theme-toggle" onClick={cycle} title={`Theme: ${label}`}>
      <span className="theme-icon">{icon}</span>
    </button>
  )
}
