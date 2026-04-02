import { GitHubApiError } from './types'

export async function fetchFileContents(
  owner: string,
  repo: string,
  filePath: string,
  ref: string,
  pat: string | null,
): Promise<{ content: string; size: number }> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(ref)}`

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (pat) {
    headers['Authorization'] = `Bearer ${pat}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GitHubApiError(
        'Authentication failed. Check your GitHub PAT.',
        'auth',
      )
    }
    if (response.status === 404) {
      throw new GitHubApiError(
        'File not found. The ref or path may be invalid.',
        'not_found',
      )
    }
    if (response.status === 429) {
      throw new GitHubApiError(
        'GitHub API rate limit exceeded. Try again later.',
        'rate_limit',
      )
    }
    throw new GitHubApiError(
      `GitHub API error: ${response.status}`,
      'unknown',
    )
  }

  const data = await response.json()

  if (data.encoding !== 'base64' || typeof data.content !== 'string') {
    throw new GitHubApiError('Unexpected response format from GitHub.', 'unknown')
  }

  const content = atob(data.content.replace(/\n/g, ''))
  return { content, size: data.size }
}
