export interface GitHubPermalink {
  owner: string
  repo: string
  ref: string
  filePath: string
  fileName: string
  lineStart: number // 0 = no line specified
  lineEnd: number // 0 = no line specified
  url: string
}

export class GitHubApiError extends Error {
  readonly code: 'auth' | 'not_found' | 'rate_limit' | 'unknown'

  constructor(
    message: string,
    code: 'auth' | 'not_found' | 'rate_limit' | 'unknown',
  ) {
    super(message)
    this.name = 'GitHubApiError'
    this.code = code
  }
}
