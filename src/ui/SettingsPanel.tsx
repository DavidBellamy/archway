import { useState } from 'react'
import { usePat } from '../state/pat-context'
import { useTheme } from '../state/theme-context'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { pat, setPat } = usePat()
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  const [inputValue, setInputValue] = useState(pat ?? '')

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 360,
        zIndex: 10001,
        background: isDark ? '#0d1117' : '#ffffff',
        borderLeft: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
        boxShadow: isDark
          ? '-4px 0 16px rgba(0,0,0,0.3)'
          : '-4px 0 16px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: isDark ? '#e6edf3' : '#1f2328',
          }}
        >
          Settings
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            color: isDark ? '#8b949e' : '#656d76',
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 20, flex: 1, overflow: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? '#e6edf3' : '#1f2328',
              marginBottom: 8,
            }}
          >
            GitHub Personal Access Token
          </label>
          <p
            style={{
              fontSize: 12,
              color: isDark ? '#8b949e' : '#656d76',
              margin: '0 0 12px',
              lineHeight: 1.5,
            }}
          >
            Required for private repos and higher API rate limits (5,000 req/hr
            vs 60). Create a token at{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: isDark ? '#58a6ff' : '#0969da' }}
            >
              github.com/settings/tokens
            </a>{' '}
            with <code style={{ fontSize: 11 }}>repo</code> scope.
          </p>
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 13,
              fontFamily: 'monospace',
              border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
              borderRadius: 6,
              background: isDark ? '#161b22' : '#f6f8fa',
              color: isDark ? '#e6edf3' : '#1f2328',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{ display: 'flex', gap: 8, marginTop: 12 }}
          >
            <button
              onClick={() => setPat(inputValue || null)}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
                borderRadius: 6,
                cursor: 'pointer',
                background: isDark ? '#238636' : '#2da44e',
                color: '#ffffff',
              }}
            >
              Save
            </button>
            {pat && (
              <button
                onClick={() => {
                  setPat(null)
                  setInputValue('')
                }}
                style={{
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  border: `1px solid ${isDark ? '#f8514966' : '#cf222e33'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: isDark ? '#f85149' : '#cf222e',
                }}
              >
                Clear
              </button>
            )}
          </div>
          {pat && (
            <p
              style={{
                fontSize: 12,
                color: isDark ? '#3fb950' : '#1a7f37',
                marginTop: 8,
              }}
            >
              Token saved (stored in browser only, never exported)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
