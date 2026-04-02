import ELK from 'elkjs/lib/elk.bundled.js'
import type { ArchwayYamlBlock, ArchwayYamlConnection, ArchwayYamlLayout } from './schema'

const elk = new ELK()

const DIRECTION_MAP: Record<string, string> = {
  'top-to-bottom': 'DOWN',
  'left-to-right': 'RIGHT',
}

// Estimated dimensions for different block types
function blockSize(block: ArchwayYamlBlock): { w: number; h: number } {
  if (block.type === 'note') return { w: 220, h: 180 }
  if (block.type === 'text') return { w: 300, h: 100 }
  return { w: 480, h: 220 } // code blocks
}

/**
 * Compute positions for blocks using ELK's layered algorithm.
 * Blocks with explicit `position` keep theirs; the rest get auto-placed.
 */
export async function assignPositions(
  blocks: ArchwayYamlBlock[],
  connections: ArchwayYamlConnection[],
  layout?: ArchwayYamlLayout,
): Promise<Map<string, [number, number]>> {
  const positions = new Map<string, [number, number]>()

  // Separate fixed vs auto-layout blocks
  const fixedBlocks: ArchwayYamlBlock[] = []
  const autoBlocks: ArchwayYamlBlock[] = []
  for (const block of blocks) {
    if (block.position) {
      fixedBlocks.push(block)
      positions.set(block.id, block.position)
    } else {
      autoBlocks.push(block)
    }
  }

  // If everything has manual positions, nothing to compute
  if (autoBlocks.length === 0) return positions

  // Build ELK graph from auto-layout blocks.
  // Include fixed blocks as reference nodes (they participate in edge routing
  // but their position is overridden after).
  const autoIds = new Set(autoBlocks.map((b) => b.id))
  const allIds = new Set(blocks.map((b) => b.id))

  const direction = DIRECTION_MAP[layout?.direction ?? 'top-to-bottom'] ?? 'DOWN'
  const layerSpacing = layout?.layerSpacing ?? 600
  const nodeSpacing = layout?.nodeSpacing ?? 250

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': String(nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'ORTHOGONAL',
      // Spread connected components apart
      'elk.spacing.componentComponent': String(layerSpacing * 1.2),
      // Edge spacing
      'elk.spacing.edgeEdge': '60',
      'elk.spacing.edgeNode': '80',
      // Don't compact too aggressively
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: blocks.map((block) => {
      const { w, h } = blockSize(block)
      return {
        id: block.id,
        width: w,
        height: h,
      }
    }),
    edges: connections
      .filter((c) => allIds.has(c.from) && allIds.has(c.to))
      .map((c, i) => ({
        id: `e${i}`,
        sources: [c.from],
        targets: [c.to],
      })),
  }

  const result = await elk.layout(elkGraph)

  // Apply computed positions for auto-layout blocks
  for (const child of result.children ?? []) {
    if (autoIds.has(child.id) && child.x != null && child.y != null) {
      positions.set(child.id, [child.x, child.y])
    }
  }

  return positions
}
