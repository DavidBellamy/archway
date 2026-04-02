import type { TLEditorSnapshot } from 'tldraw'

export interface ArchwayFile {
  archway: {
    version: string
    name: string
    createdAt: string
    modifiedAt: string
  }
  tldraw: TLEditorSnapshot
}
