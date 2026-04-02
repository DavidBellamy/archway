const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.swift': 'swift',
  '.rb': 'ruby',
  '.php': 'php',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.md': 'markdown',
  '.mdx': 'mdx',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  '.xml': 'xml',
  '.svg': 'xml',
  '.dockerfile': 'dockerfile',
  '.diff': 'diff',
  '.patch': 'diff',
  '.lua': 'lua',
  '.r': 'r',
  '.R': 'r',
  '.scala': 'scala',
  '.zig': 'zig',
  '.vue': 'vue',
  '.svelte': 'svelte',
}

export function detectLanguage(fileName: string): string {
  // Handle Dockerfile (no extension)
  if (fileName.toLowerCase() === 'dockerfile') return 'dockerfile'

  const dotIdx = fileName.lastIndexOf('.')
  if (dotIdx === -1) return 'text'

  const ext = fileName.slice(dotIdx).toLowerCase()
  return EXT_TO_LANG[ext] ?? 'text'
}
