'use client'
import { useState, useEffect } from 'react'

const THEMES = [
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'light-royal', label: 'Royal', icon: 'sun' },
  { id: 'light-forest', label: 'Forest', icon: 'sun' },
] as const

type ThemeId = typeof THEMES[number]['id']

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeId>('dark')

  useEffect(() => {
    // Prefer the attribute set by the pre-hydration script in layout.tsx
    const attr = document.documentElement.getAttribute('data-theme') as ThemeId | null
    if (attr && THEMES.some(t => t.id === attr)) {
      setTheme(attr)
      return
    }
    const saved = localStorage.getItem('kb-theme') as ThemeId | null
    if (saved && THEMES.some(t => t.id === saved)) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const cycle = () => {
    const currentIdx = THEMES.findIndex(t => t.id === theme)
    const next = THEMES[(currentIdx + 1) % THEMES.length]
    setTheme(next.id)
    document.documentElement.setAttribute('data-theme', next.id)
    localStorage.setItem('kb-theme', next.id)
  }

  const current = THEMES.find(t => t.id === theme) || THEMES[0]
  const isLight = theme !== 'dark'

  return (
    <button
      onClick={cycle}
      title={`Theme: ${current.label}. Click to switch.`}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '6px',
        background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}`,
        color: isLight ? '#4A5568' : '#9BA8C0',
        fontSize: '12px', fontWeight: 510, cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'all 0.2s ease',
      }}
    >
      {isLight ? (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="4"/>
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M13.5 8.5a5.5 5.5 0 1 1-7-7 4.5 4.5 0 0 0 7 7z"/>
        </svg>
      )}
      {current.label}
    </button>
  )
}
