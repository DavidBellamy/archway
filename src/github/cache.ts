import { fetchFileContents } from './api-client'

const cache = new Map<string, { content: string; size: number }>()

function cacheKey(owner: string, repo: string, ref: string, filePath: string): string {
  return `${owner}/${repo}/${ref}/${filePath}`
}

function isImmutableRef(ref: string): boolean {
  return /^[0-9a-f]{40}$/i.test(ref)
}

export async function fetchWithCache(
  owner: string,
  repo: string,
  filePath: string,
  ref: string,
  pat: string | null,
): Promise<{ content: string; size: number }> {
  const key = cacheKey(owner, repo, ref, filePath)
  const cached = cache.get(key)
  if (cached) return cached

  const result = await fetchFileContents(owner, repo, filePath, ref, pat)

  if (isImmutableRef(ref)) {
    cache.set(key, result)
  }

  return result
}
