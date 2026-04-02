import { type Editor, createShapeId } from 'tldraw'
import { parseGitHubPermalink } from '../../github/url-parser'
import { fetchWithCache } from '../../github/cache'
import { detectLanguage } from '../../highlighting/language-map'
import { GITHUB_CODE_BLOCK_TYPE } from '../../lib/constants'

export function registerGitHubPasteHandler(
  editor: Editor,
  getPat: () => string | null,
) {
  // Intercept URL pastes: tldraw classifies pasted URLs as 'url' type
  editor.registerExternalContentHandler('url', async (content) => {
    const url = content.url?.trim()
    if (!url) return

    const permalink = parseGitHubPermalink(url)
    if (!permalink) {
      // Not a GitHub permalink. Create a bookmark instead (tldraw default for URLs).
      editor.putExternalContent({ ...content, type: 'url' as never })
      return
    }

    createCodeBlockFromPermalink(editor, permalink, content.point, getPat)
  })
}

function createCodeBlockFromPermalink(
  editor: Editor,
  permalink: ReturnType<typeof parseGitHubPermalink> & {},
  point: { x: number; y: number } | undefined,
  getPat: () => string | null,
) {
  const center = point ?? editor.getViewportPageBounds().center
  const shapeId = createShapeId()

  editor.createShape({
    id: shapeId,
    type: GITHUB_CODE_BLOCK_TYPE,
    x: center.x - 240,
    y: center.y - 100,
    props: {
      w: 480,
      h: 200,
      url: permalink.url,
      owner: permalink.owner,
      repo: permalink.repo,
      ref: permalink.ref,
      filePath: permalink.filePath,
      fileName: permalink.fileName,
      lineStart: permalink.lineStart,
      lineEnd: permalink.lineEnd,
      language: detectLanguage(permalink.fileName),
      branch: '',
      fetchStatus: 'loading',
      fetchedCode: '',
      errorMessage: '',
    },
  })

  fetchWithCache(
    permalink.owner,
    permalink.repo,
    permalink.filePath,
    permalink.ref,
    getPat(),
  )
    .then(({ content }) => {
      const lines = content.split('\n')
      const displayLineCount =
        permalink.lineStart > 0
          ? Math.min(
              lines.length,
              (permalink.lineEnd || permalink.lineStart) - permalink.lineStart + 1,
            )
          : lines.length
      const autoHeight = Math.min(600, Math.max(120, displayLineCount * 18 + 60))

      editor.updateShape({
        id: shapeId,
        type: GITHUB_CODE_BLOCK_TYPE,
        props: {
          fetchedCode: content,
          fetchStatus: 'success',
          h: autoHeight,
        },
      })
    })
    .catch((err: unknown) => {
      editor.updateShape({
        id: shapeId,
        type: GITHUB_CODE_BLOCK_TYPE,
        props: {
          fetchStatus: 'error',
          errorMessage:
            err instanceof Error ? err.message : 'Failed to fetch code',
        },
      })
    })
}
