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
  className,
  style,
}: HighlightedCodeProps) {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      const highlighter = await getHighlighter()

      const loadedLangs = highlighter.getLoadedLanguages()
      const lang = loadedLangs.includes(language) ? language : 'text'

      // Extract line range if specified
      const lines = code.split('\n')
      const start = lineStart ? Math.max(1, lineStart) : 1
      const end = lineEnd ? Math.min(lines.length, lineEnd) : lines.length
      const slice = lines.slice(start - 1, end).join('\n')

      // Build decorations for highlighted lines
      const decorations: Parameters<typeof highlighter.codeToHtml>[1] extends {
        decorations?: infer D
      }
        ? NonNullable<D>
        : never = []

      if (highlightLines) {
        const hlStart = Math.max(0, highlightLines[0] - start)
        const hlEnd = Math.min(end - start, highlightLines[1] - start)
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

      // Shiki output is safe (it escapes source code), but sanitize for defense-in-depth
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

  return (
    <div
      className={className}
      style={{ fontSize: '13px', lineHeight: '1.45', ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
