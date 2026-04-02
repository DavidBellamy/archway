import { useRef } from 'react'
import { useEditor } from 'tldraw'
import { useTheme } from '../state/theme-context'
import { exportDiagram } from '../persistence/export'
import { importDiagram } from '../persistence/import'

export function ExportImportButtons() {
  const editor = useEditor()
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const yamlInputRef = useRef<HTMLInputElement>(null)

  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: isDark ? '#c9d1d9' : '#374151',
  }

  return (
    <>
      <button
        onClick={() => exportDiagram(editor)}
        style={buttonStyle}
        title="Export diagram as JSON"
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14ZM7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
        </svg>
        Export
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        style={buttonStyle}
        title="Import diagram from JSON"
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14ZM11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z" />
        </svg>
        Import
      </button>

      <button
        onClick={() => yamlInputRef.current?.click()}
        style={buttonStyle}
        title="Import diagram from YAML"
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14ZM11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z" />
        </svg>
        YAML
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.yaml,.yml"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const name = file.name.toLowerCase()
          if (name.endsWith('.yaml') || name.endsWith('.yml')) {
            // Route YAML files to the YAML handler
            window.dispatchEvent(
              new CustomEvent('archway:import-yaml', { detail: { file } }),
            )
          } else {
            try {
              await importDiagram(editor, file)
            } catch (err) {
              alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
          }
          e.target.value = ''
        }}
      />
      <input
        ref={yamlInputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          // YAML import will be wired in Phase 9
          window.dispatchEvent(
            new CustomEvent('archway:import-yaml', { detail: { file } }),
          )
          e.target.value = ''
        }}
      />
    </>
  )
}
