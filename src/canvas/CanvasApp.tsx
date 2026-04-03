import { useCallback, useEffect, useRef } from 'react'
import { Tldraw, useEditor, type Editor } from 'tldraw'
import { GitHubCodeBlockShapeUtil } from './shapes/github-code-block'
import { GitHubCodeBlockPopup } from './shapes/github-code-block/GitHubCodeBlockPopup'
import { registerGitHubPasteHandler } from './paste/github-paste-handler'
import { Toolbar } from '../ui/Toolbar'
import { ExportImportButtons } from '../ui/ExportImportButtons'
import { useTheme } from '../state/theme-context'
import { LS_PAT } from '../lib/constants'
import { parseArchwayYaml } from '../yaml-import/parser'
import { buildDiagramFromYaml } from '../yaml-import/builder'

const customShapeUtils = [GitHubCodeBlockShapeUtil]

export function CanvasApp() {
  const { resolved } = useTheme()

  const handleMount = useCallback((editor: Editor) => {
    const getPat = () => localStorage.getItem(LS_PAT)
    registerGitHubPasteHandler(editor, getPat)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw shapeUtils={customShapeUtils} onMount={handleMount}>
        <ThemeSyncer />
        <Toolbar>
          <ExportImportButtons />
        </Toolbar>
        <GitHubCodeBlockPopup />
        <YamlImportListener />
      </Tldraw>
    </div>
  )
}

/** Syncs React theme context to tldraw whenever it changes */
function ThemeSyncer() {
  const editor = useEditor()
  const { resolved } = useTheme()

  useEffect(() => {
    editor.user.updateUserPreferences({ colorScheme: resolved })
  }, [editor, resolved])

  return null
}

/** Listens for YAML file import events dispatched by ExportImportButtons */
function YamlImportListener() {
  const editor = useEditor()
  const editorRef = useRef(editor)
  editorRef.current = editor

  useEffect(() => {
    const handler = async (e: Event) => {
      const file = (e as CustomEvent).detail?.file as File | undefined
      if (!file) return

      try {
        const text = await file.text()
        const diagram = parseArchwayYaml(text)
        await buildDiagramFromYaml(editorRef.current, diagram)
      } catch (err) {
        alert(
          `YAML import failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
    }

    window.addEventListener('archway:import-yaml', handler)
    return () => window.removeEventListener('archway:import-yaml', handler)
  }, [])

  return null
}
