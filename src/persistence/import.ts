import type { Editor } from 'tldraw'
import type { ArchwayFile } from './file-format'

export async function importDiagram(editor: Editor, file: File): Promise<string> {
  const text = await file.text()
  const data = JSON.parse(text) as ArchwayFile

  if (!data.archway?.version || !data.tldraw) {
    throw new Error('Invalid Archway file format.')
  }

  editor.loadSnapshot(data.tldraw)

  return data.archway.name
}
