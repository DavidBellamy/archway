import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, type TLShapeId } from 'tldraw'
import { usePopup } from '../../../state/popup-context'
import { useTheme } from '../../../state/theme-context'
import { HighlightedCode } from '../../../highlighting/HighlightedCode'
import type { GitHubCodeBlockShape } from './GitHubCodeBlockShape'
import { GITHUB_CODE_BLOCK_TYPE } from '../../../lib/constants'

const CONTEXT_LINES = 50

export function GitHubCodeBlockPopup() {
  const editor = useEditor()
  const { popup, openPopup, closePopup } = usePopup()
  const { resolved } = useTheme()
  const theme = resolved === 'dark' ? 'github-dark' : 'github-light'
  const isDark = resolved === 'dark'

  const [showFullFile, setShowFullFile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Listen for custom event from ShapeUtil
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { shapeId: TLShapeId }
      if (detail?.shapeId) {
        setShowFullFile(false)
        openPopup(detail.shapeId)
      }
    }
    window.addEventListener('archway:open-popup', handler)
    return () => window.removeEventListener('archway:open-popup', handler)
  }, [openPopup])

  // Close on Escape
  useEffect(() => {
    if (!popup.isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [popup.isOpen, closePopup])

  // Scroll to highlighted lines after render
  useEffect(() => {
    if (!popup.isOpen) return
    // Wait for Shiki to render, then scroll to the first highlighted line
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current
      if (!container) return
      const highlighted = container.querySelector('.archway-highlighted-line')
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'center', behavior: 'instant' })
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [popup.isOpen, popup.shapeId, showFullFile])

  if (!popup.isOpen || !popup.shapeId) return null

  const shape = editor.getShape(popup.shapeId) as GitHubCodeBlockShape | undefined
  if (!shape || shape.type !== GITHUB_CODE_BLOCK_TYPE) return null
  if (shape.props.fetchStatus !== 'success') return null

  const { fetchedCode, lineStart, lineEnd, fileName, language, url } = shape.props
  const allLines = fetchedCode.split('\n')
  const totalLines = allLines.length

  // Determine visible range
  let viewStart: number
  let viewEnd: number

  if (showFullFile) {
    viewStart = 1
    viewEnd = totalLines
  } else if (lineStart > 0) {
    viewStart = Math.max(1, lineStart - CONTEXT_LINES)
    viewEnd = Math.min(totalLines, (lineEnd || lineStart) + CONTEXT_LINES)
  } else {
    viewStart = 1
    viewEnd = totalLines
  }

  // Highlight range (the originally linked lines)
  const highlightLines: [number, number] | undefined =
    lineStart > 0 ? [lineStart, lineEnd || lineStart] : undefined

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={closePopup}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '80vw',
          maxWidth: 900,
          maxHeight: '80vh',
          borderRadius: 12,
          border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
          background: isDark ? '#0d1117' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 16px 48px rgba(0,0,0,0.4)'
            : '0 16px 48px rgba(0,0,0,0.12)',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: isDark ? '#161b22' : '#f6f8fa',
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill={isDark ? '#8b949e' : '#656d76'}
          >
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
          </svg>
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: isDark ? '#e6edf3' : '#1f2328',
            }}
          >
            {fileName}
          </span>
          {highlightLines && (
            <span
              style={{
                fontSize: 12,
                color: isDark ? '#8b949e' : '#656d76',
              }}
            >
              L{highlightLines[0]}
              {highlightLines[1] > highlightLines[0]
                ? `-L${highlightLines[1]}`
                : ''}
            </span>
          )}
          <span style={{ flex: 1 }} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: isDark ? '#58a6ff' : '#0969da',
              textDecoration: 'none',
            }}
          >
            Open on GitHub
          </a>
          <button
            onClick={closePopup}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: isDark ? '#8b949e' : '#656d76',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Code viewer */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '8px 0',
          }}
        >
          <div ref={highlightRef}>
            <HighlightedCode
              code={fetchedCode}
              language={language}
              theme={theme}
              lineStart={viewStart}
              lineEnd={viewEnd}
              highlightLines={highlightLines}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: isDark ? '#161b22' : '#f6f8fa',
            flexShrink: 0,
            fontSize: 12,
            color: isDark ? '#8b949e' : '#656d76',
          }}
        >
          <span>
            Showing lines {viewStart}-{viewEnd} of {totalLines}
          </span>
          {!showFullFile && viewEnd < totalLines && (
            <button
              onClick={() => setShowFullFile(true)}
              style={{
                background: 'none',
                border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
                borderRadius: 6,
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: 12,
                color: isDark ? '#58a6ff' : '#0969da',
              }}
            >
              Load full file
            </button>
          )}
          <span style={{ flex: 1 }} />
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
