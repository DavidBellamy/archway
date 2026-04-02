import { createShapeId, toRichText, type Editor } from 'tldraw'
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
  const positions = await assignPositions(
    diagram.blocks,
    diagram.connections ?? [],
    diagram.layout,
  )
  const shapeIdMap = new Map<string, ReturnType<typeof createShapeId>>()

  // Create all shapes
  for (const block of diagram.blocks) {
    const [x, y] = positions.get(block.id)!
    const shapeId = createShapeId()
    shapeIdMap.set(block.id, shapeId)

    if (block.type === 'code' && block.url) {
      const permalink = parseGitHubPermalink(block.url)
      if (!permalink) {
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
            branch: block.branch ?? '',
            fetchStatus: 'error',
            fetchedCode: '',
            errorMessage: `Invalid GitHub permalink: ${block.url}`,
          },
        })
        continue
      }

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
          branch: block.branch ?? '',
          fetchStatus: 'loading',
          fetchedCode: '',
          errorMessage: '',
        },
      })

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
      const noteText = block.content ?? block.label ?? ''
      editor.createShape({
        type: 'note',
        id: shapeId,
        x,
        y,
        props: {
          richText: toRichText(noteText),
        },
      } as Parameters<typeof editor.createShape>[0])
    } else {
      // Default: text/geo block
      const geoText = block.content ?? block.label ?? ''
      editor.createShape({
        type: 'geo',
        id: shapeId,
        x,
        y,
        props: {
          richText: toRichText(geoText),
          w: 300,
          h: 100,
          geo: 'rectangle',
        },
      } as Parameters<typeof editor.createShape>[0])
    }
  }

  // Create connections as bound arrows.
  // Bindings make arrows follow shapes when dragged.
  if (diagram.connections) {
    for (const conn of diagram.connections) {
      const sourceId = shapeIdMap.get(conn.from)
      const targetId = shapeIdMap.get(conn.to)
      if (!sourceId || !targetId) continue

      // Place arrow roughly between the two shapes
      const fromPos = positions.get(conn.from)!
      const toPos = positions.get(conn.to)!
      const midX = (fromPos[0] + toPos[0]) / 2
      const midY = (fromPos[1] + toPos[1]) / 2

      const arrowId = createShapeId()
      editor.createShape({
        id: arrowId,
        type: 'arrow',
        x: midX,
        y: midY,
        props: {
          richText: toRichText(conn.label ?? ''),
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        },
      } as Parameters<typeof editor.createShape>[0])

      // Bind arrow start to source shape
      editor.createBinding({
        type: 'arrow',
        fromId: arrowId,
        toId: sourceId,
        props: {
          terminal: 'start',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      } as Parameters<typeof editor.createBinding>[0])

      // Bind arrow end to target shape
      editor.createBinding({
        type: 'arrow',
        fromId: arrowId,
        toId: targetId,
        props: {
          terminal: 'end',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      } as Parameters<typeof editor.createBinding>[0])
    }
  }
}
