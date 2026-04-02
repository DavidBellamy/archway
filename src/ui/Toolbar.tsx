import { useState } from 'react'
import { useTheme } from '../state/theme-context'
import { ThemeToggle } from './ThemeToggle'
import { SettingsPanel } from './SettingsPanel'

export function Toolbar({ children }: { children?: React.ReactNode }) {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 8,
          background: isDark
            ? 'rgba(22, 27, 34, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
          backdropFilter: 'blur(8px)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <ThemeToggle />
        <Separator isDark={isDark} />
        {children}
        <Separator isDark={isDark} />
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
          className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294a6.1 6.1 0 0 1 0 .772c-.01.147.04.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.103-.303c-.066-.018-.176-.011-.299.071a5.917 5.917 0 0 1-.668.386c-.133.066-.194.158-.212.224l-.288 1.107c-.17.645-.716 1.195-1.459 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.065-1.289-.615-1.459-1.26l-.288-1.107c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.049-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.04-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.103.303c.066.018.176.011.299-.071.214-.143.437-.272.668-.386.133-.066.194-.158.212-.224L5.84 1.29c.17-.645.716-1.195 1.459-1.26A8.094 8.094 0 0 1 8 0Zm1.519 11.243c-.965.57-2.076.698-3.038.398-.963-.3-1.768-1.008-2.19-2.063-.421-1.055-.374-2.18.094-3.108.468-.927 1.359-1.647 2.538-1.835 1.18-.188 2.264.263 3.006.957.742.694 1.15 1.678 1.048 2.694-.102 1.016-.645 1.956-1.458 2.957Zm-1.024-6.81A3.983 3.983 0 0 0 8 4.5a4 4 0 1 0 .495-.067Z" />
          </svg>
        </button>
      </div>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.3)',
          }}
          onClick={() => setSettingsOpen(false)}
        />
      )}
    </>
  )
}

function Separator({ isDark }: { isDark: boolean }) {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: isDark ? '#30363d' : '#d1d5db',
      }}
    />
  )
}
