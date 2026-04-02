import { useTheme } from '../state/theme-context'

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  const next = () => {
    const cycle = { light: 'dark', dark: 'system', system: 'light' } as const
    setMode(cycle[mode])
  }

  const label = { light: 'Light', dark: 'Dark', system: 'System' }[mode]
  const icon = { light: '☀', dark: '☾', system: '◐' }[mode]

  return (
    <button
      onClick={next}
      title={`Theme: ${label}`}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 16,
        padding: '4px 8px',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
      className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
    >
      <span>{icon}</span>
      <span style={{ fontSize: 12 }}>{label}</span>
    </button>
  )
}
