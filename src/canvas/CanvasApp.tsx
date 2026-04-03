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
  const handleMount = useCallback((editor: Editor) => {
    const getPat = () => localStorage.getItem(LS_PAT)
    registerGitHubPasteHandler(editor, getPat)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw shapeUtils={customShapeUtils} onMount={handleMount} persistenceKey="archway">
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

/** Listens for YAML file import events and drag-and-drop */
function YamlImportListener() {
  const editor = useEditor()
  const editorRef = useRef(editor)
  editorRef.current = editor

  const importYaml = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const diagram = parseArchwayYaml(text)
      await buildDiagramFromYaml(editorRef.current, diagram)
      // Wait for shapes to settle, then zoom to fit
      setTimeout(() => {
        editorRef.current.zoomToFit({ animation: { duration: 300 } })
      }, 400)
    } catch (err) {
      alert(
        `YAML import failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
    }
  }, [])

  // Listen for custom event from toolbar button
  useEffect(() => {
    const handler = (e: Event) => {
      const file = (e as CustomEvent).detail?.file as File | undefined
      if (file) importYaml(file)
    }
    window.addEventListener('archway:import-yaml', handler)
    return () => window.removeEventListener('archway:import-yaml', handler)
  }, [importYaml])

  // Auto-load YAML from ?yaml=/path/to/file.yaml URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const yamlPath = params.get('yaml')
    if (!yamlPath) return

    const url = yamlPath.startsWith('http')
      ? yamlPath
      : `/__local_file?path=${encodeURIComponent(yamlPath)}`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.text()
      })
      .then((text) => {
        const name = yamlPath.split('/').pop() || 'diagram.yaml'
        const file = new File([text], name, { type: 'text/yaml' })
        importYaml(file)
      })
      .catch((err) => {
        console.error('Failed to load YAML from URL param:', err)
      })
  }, [importYaml])

  // Drag-and-drop .yaml files onto the canvas
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault()
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      }
    }
    const handleDrop = (e: DragEvent) => {
      const file = e.dataTransfer?.files[0]
      if (!file) return
      const name = file.name.toLowerCase()
      if (name.endsWith('.yaml') || name.endsWith('.yml')) {
        e.preventDefault()
        e.stopPropagation()
        importYaml(file)
      }
    }
    // Use capture phase so we intercept before tldraw rejects the file type
    window.addEventListener('dragover', handleDragOver, true)
    window.addEventListener('drop', handleDrop, true)
    return () => {
      window.removeEventListener('dragover', handleDragOver, true)
      window.removeEventListener('drop', handleDrop, true)
    }
  }, [importYaml])

  return null
}
