import type { TLBaseShape } from 'tldraw'
import { GITHUB_CODE_BLOCK_TYPE } from '../../../lib/constants'

export interface GitHubCodeBlockProps {
  w: number
  h: number
  url: string
  owner: string
  repo: string
  ref: string
  filePath: string
  fileName: string
  lineStart: number // 0 = no line specified
  lineEnd: number // 0 = no line specified
  fetchedCode: string
  language: string
  fetchStatus: string // 'idle' | 'loading' | 'success' | 'error'
  errorMessage: string
}

// Register the custom shape type in tldraw's global type registry
declare module 'tldraw' {
  interface TLGlobalShapePropsMap {
    [GITHUB_CODE_BLOCK_TYPE]: GitHubCodeBlockProps
  }
}

export type GitHubCodeBlockShape = TLBaseShape<
  typeof GITHUB_CODE_BLOCK_TYPE,
  GitHubCodeBlockProps
>
