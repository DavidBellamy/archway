import type { GitHubPermalink } from './types'

const PERMALINK_RE =
  /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:#L(\d+)(?:-L(\d+))?)?$/

export function parseGitHubPermalink(input: string): GitHubPermalink | null {
  const match = input.trim().match(PERMALINK_RE)
  if (!match) return null

  const [, owner, repo, ref, filePath, startStr, endStr] = match
  const fileName = filePath.split('/').pop() ?? filePath
  const lineStart = startStr ? parseInt(startStr, 10) : 0
  const lineEnd = endStr ? parseInt(endStr, 10) : lineStart

  return {
    owner,
    repo,
    ref,
    filePath,
    fileName,
    lineStart,
    lineEnd,
    url: input.trim(),
  }
}

export function isGitHubPermalink(text: string): boolean {
  return PERMALINK_RE.test(text.trim())
}
