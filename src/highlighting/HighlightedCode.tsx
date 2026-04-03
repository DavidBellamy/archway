import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { getHighlighter } from './highlighter'

interface HighlightedCodeProps {
  code: string
  language: string
  theme: 'github-dark' | 'github-light'
  lineStart?: number // 1-based, first line number to display
  lineEnd?: number // 1-based, last line number to display
  highlightLines?: [number, number] // 1-based range of lines to visually highlight
  showLineNumbers?: boolean // show gutter line numbers (default: false)
  className?: string
  style?: React.CSSProperties
}

export function HighlightedCode({
  code,
  language,
  theme,
  lineStart,
  lineEnd,
  highlightLines,
  showLineNumbers = false,
  className,
  style,
}: HighlightedCodeProps) {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const start = lineStart ? Math.max(1, lineStart) : 1

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      const highlighter = await getHighlighter()

      const loadedLangs = highlighter.getLoadedLanguages()
      const lang = loadedLangs.includes(language) ? language : 'text'

      const lines = code.split('\n')
      const s = lineStart ? Math.max(1, lineStart) : 1
      const end = lineEnd ? Math.min(lines.length, lineEnd) : lines.length
      const slice = lines.slice(s - 1, end).join('\n')

      const decorations: Parameters<typeof highlighter.codeToHtml>[1] extends {
        decorations?: infer D
      }
        ? NonNullable<D>
        : never = []

      if (highlightLines) {
        const hlStart = Math.max(0, highlightLines[0] - s)
        const hlEnd = Math.min(end - s, highlightLines[1] - s)
        for (let i = hlStart; i <= hlEnd; i++) {
          decorations.push({
            start: { line: i, character: 0 },
            end: { line: i, character: (slice.split('\n')[i] ?? '').length },
            properties: { class: 'archway-highlighted-line' },
          })
        }
      }

      const rawHtml = highlighter.codeToHtml(slice, {
        lang,
        theme,
        decorations,
      })

      const sanitized = DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['style'],
      })

      if (!cancelled) {
        setHtml(sanitized)
        setLoading(false)
      }
    }

    highlight()
    return () => {
      cancelled = true
    }
  }, [code, language, theme, lineStart, lineEnd, highlightLines])

  if (loading) {
    return (
      <div
        className={className}
        style={{
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '13px',
          color: theme === 'github-dark' ? '#8b949e' : '#656d76',
          ...style,
        }}
      >
        Loading...
      </div>
    )
  }

  // Set CSS custom property for the starting line number so the
  // counter-based gutter in index.css starts at the right value
  const wrapperStyle: React.CSSProperties = {
    ...style,
    ...(showLineNumbers
      ? { '--archway-line-start': start } as React.CSSProperties
      : {}),
  }

  return (
    <div
      className={`${className ?? ''} ${showLineNumbers ? 'archway-line-numbers' : ''}`.trim()}
      style={wrapperStyle}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
