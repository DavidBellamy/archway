import type { Editor } from 'tldraw'
import { APP_VERSION } from '../lib/constants'
import type { ArchwayFile } from './file-format'

export function exportDiagram(editor: Editor, name: string = 'Untitled') {
  const snapshot = editor.getSnapshot()

  const archwayFile: ArchwayFile = {
    archway: {
      version: APP_VERSION,
      name,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    tldraw: snapshot,
  }

  const json = JSON.stringify(archwayFile, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/[^a-z0-9-_]/gi, '-')}.archway.json`
  a.click()
  URL.revokeObjectURL(url)
}
