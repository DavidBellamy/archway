import { createShapeId, type Editor } from 'tldraw'
import type { ArchwayYamlDiagram } from './schema'
import { assignPositions } from './layout'
import { parseGitHubPermalink } from '../github/url-parser'
import { fetchWithCache } from '../github/cache'
import { detectLanguage } from '../highlighting/language-map'
import { GITHUB_CODE_BLOCK_TYPE, LS_PAT } from '../lib/constants'

export async function buildDiagramFromYaml(
  editor: Editor,
  diagram: ArchwayYamlDiagram,
) {
  const positions = assignPositions(diagram.blocks)
  const shapeIdMap = new Map<string, ReturnType<typeof createShapeId>>()

  // Create all shapes
  for (const block of diagram.blocks) {
    const [x, y] = positions.get(block.id)!
    const shapeId = createShapeId()
    shapeIdMap.set(block.id, shapeId)

    if (block.type === 'code' && block.url) {
      const permalink = parseGitHubPermalink(block.url)
      if (!permalink) {
        // Invalid URL, create as error code block
        editor.createShape({
          id: shapeId,
          type: GITHUB_CODE_BLOCK_TYPE,
          x,
          y,
          props: {
            w: 480,
            h: 200,
            url: block.url,
            owner: '',
            repo: '',
            ref: '',
            filePath: '',
            fileName: block.label ?? 'Invalid URL',
            lineStart: 0,
            lineEnd: 0,
            language: 'text',
            fetchStatus: 'error',
            fetchedCode: '',
            errorMessage: `Invalid GitHub permalink: ${block.url}`,
          },
        })
        continue
      }

      // Create code block in loading state
      editor.createShape({
        id: shapeId,
        type: GITHUB_CODE_BLOCK_TYPE,
        x,
        y,
        props: {
          w: 480,
          h: 200,
          url: permalink.url,
          owner: permalink.owner,
          repo: permalink.repo,
          ref: permalink.ref,
          filePath: permalink.filePath,
          fileName: block.label ?? permalink.fileName,
          lineStart: permalink.lineStart,
          lineEnd: permalink.lineEnd,
          language: detectLanguage(permalink.fileName),
          fetchStatus: 'loading',
          fetchedCode: '',
          errorMessage: '',
        },
      })

      // Fetch asynchronously
      const pat = localStorage.getItem(LS_PAT)
      fetchWithCache(
        permalink.owner,
        permalink.repo,
        permalink.filePath,
        permalink.ref,
        pat,
      )
        .then(({ content }) => {
          const lines = content.split('\n')
          const displayLineCount =
            permalink.lineStart > 0
              ? Math.min(
                  lines.length,
                  (permalink.lineEnd || permalink.lineStart) -
                    permalink.lineStart +
                    1,
                )
              : lines.length
          const autoHeight = Math.min(
            600,
            Math.max(120, displayLineCount * 18 + 60),
          )

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
                err instanceof Error ? err.message : 'Failed to fetch',
            },
          })
        })
    } else if (block.type === 'note') {
      editor.createShape({
        type: 'note',
        id: shapeId,
        x,
        y,
        props: {
          text: block.content ?? block.label ?? '',
        },
      } as Parameters<typeof editor.createShape>[0])
    } else {
      // Default: text block
      editor.createShape({
        type: 'geo',
        id: shapeId,
        x,
        y,
        props: {
          text: block.content ?? block.label ?? '',
          w: 300,
          h: 100,
          geo: 'rectangle',
        },
      } as Parameters<typeof editor.createShape>[0])
    }
  }

  // Create connections (arrows between shapes)
  if (diagram.connections) {
    for (const conn of diagram.connections) {
      const fromId = shapeIdMap.get(conn.from)
      const toId = shapeIdMap.get(conn.to)
      if (!fromId || !toId) continue

      const fromPos = positions.get(conn.from)!
      const toPos = positions.get(conn.to)!

      // Position arrow start at right edge of source, end at left edge of target
      const startX = fromPos[0] + 480
      const startY = fromPos[1] + 100
      const endX = toPos[0]
      const endY = toPos[1] + 100

      const arrowId = createShapeId()
      editor.createShape({
        id: arrowId,
        type: 'arrow',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        props: {
          text: conn.label ?? '',
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
        },
      } as Parameters<typeof editor.createShape>[0])
    }
  }
}
