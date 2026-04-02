import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LS_THEME } from '../lib/constants'

type ThemeMode = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

interface ThemeContextValue {
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolved: 'light',
  setMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function resolveSystem(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(LS_THEME)
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
    return 'system'
  })

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(resolveSystem)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolved: ResolvedTheme = mode === 'system' ? systemTheme : mode

  // Sync to document class for Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem(LS_THEME, m)
  }, [])

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
