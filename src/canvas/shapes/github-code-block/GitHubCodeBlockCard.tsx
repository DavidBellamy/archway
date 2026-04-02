import type { GitHubCodeBlockShape } from './GitHubCodeBlockShape'

interface GitHubCodeBlockCardProps {
  shape: GitHubCodeBlockShape
  onOpenPopup: () => void
  theme: 'github-dark' | 'github-light'
}

export function GitHubCodeBlockCard({
  shape,
  onOpenPopup,
  theme,
}: GitHubCodeBlockCardProps) {
  const { props } = shape
  const isDark = theme === 'github-dark'

  const headerLabel =
    props.lineStart > 0
      ? `${props.fileName}:${props.lineStart}${props.lineEnd > props.lineStart ? `-${props.lineEnd}` : ''}`
      : props.fileName || 'Loading...'

  const repoLabel = props.owner && props.repo ? `${props.owner}/${props.repo}` : ''

  if (props.fetchStatus === 'loading') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
          border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
          background: isDark ? '#0d1117' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
            fontSize: 12,
            color: isDark ? '#8b949e' : '#656d76',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ opacity: 0.7 }}>Loading...</span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: `2px solid ${isDark ? '#30363d' : '#d1d5db'}`,
              borderTopColor: isDark ? '#58a6ff' : '#0969da',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (props.fetchStatus === 'error') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
          border: `1px solid ${isDark ? '#f8514966' : '#cf222e33'}`,
          background: isDark ? '#0d1117' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderBottom: `1px solid ${isDark ? '#f8514966' : '#cf222e33'}`,
            fontSize: 12,
            color: isDark ? '#f85149' : '#cf222e',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Error</span>
          {headerLabel && (
            <span style={{ opacity: 0.7, marginLeft: 'auto' }}>
              {headerLabel}
            </span>
          )}
        </div>
        <div
          style={{
            flex: 1,
            padding: 12,
            fontSize: 12,
            color: isDark ? '#f85149' : '#cf222e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {props.errorMessage || 'Failed to fetch code'}
        </div>
      </div>
    )
  }

  // Extract the relevant lines
  const allLines = props.fetchedCode.split('\n')
  const start = props.lineStart > 0 ? props.lineStart : 1
  const end = props.lineEnd > 0 ? props.lineEnd : allLines.length
  const displayLines = allLines.slice(start - 1, end)

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onOpenPopup()
      }}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 8,
        border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
        background: isDark ? '#0d1117' : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '6px 12px',
          borderBottom: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
          fontSize: 12,
          color: isDark ? '#8b949e' : '#656d76',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isDark ? '#161b22' : '#f6f8fa',
          flexShrink: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{ flexShrink: 0, opacity: 0.7 }}
        >
          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
        </svg>
        <span
          style={{
            fontWeight: 600,
            color: isDark ? '#e6edf3' : '#1f2328',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {headerLabel}
        </span>
        {repoLabel && (
          <span
            style={{
              marginLeft: 'auto',
              opacity: 0.6,
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            {repoLabel}
          </span>
        )}
      </div>

      {/* Code */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '8px 0',
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: 0,
            fontSize: 12,
            lineHeight: '1.45',
            color: isDark ? '#e6edf3' : '#1f2328',
          }}
        >
          {displayLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                paddingRight: 12,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 40,
                  textAlign: 'right',
                  paddingRight: 12,
                  color: isDark ? '#484f58' : '#9ca3af',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {start + i}
              </span>
              <span style={{ whiteSpace: 'pre' }}>{line}</span>
            </div>
          ))}
        </pre>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '4px 12px',
          borderTop: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
          fontSize: 11,
          color: isDark ? '#484f58' : '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: isDark ? '#161b22' : '#f6f8fa',
          flexShrink: 0,
        }}
      >
        <span>Click to expand</span>
        <span style={{ marginLeft: 'auto' }}>
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: isDark ? '#58a6ff' : '#0969da',
              textDecoration: 'none',
              fontSize: 11,
            }}
          >
            Open on GitHub
          </a>
        </span>
      </div>
    </div>
  )
}
