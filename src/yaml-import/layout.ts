import type { ArchwayYamlBlock } from './schema'

const BLOCK_WIDTH = 480
const BLOCK_HEIGHT = 200
const GAP_X = 80
const GAP_Y = 60
const COLS = 3
const START_X = 100
const START_Y = 100

/**
 * Assign positions to blocks that don't have explicit positions.
 * Uses a simple grid layout: left-to-right, top-to-bottom.
 */
export function assignPositions(blocks: ArchwayYamlBlock[]): Map<string, [number, number]> {
  const positions = new Map<string, [number, number]>()

  // First pass: collect blocks that already have positions
  for (const block of blocks) {
    if (block.position) {
      positions.set(block.id, block.position)
    }
  }

  // Second pass: assign grid positions to blocks without explicit positions
  let gridIndex = 0
  for (const block of blocks) {
    if (!block.position) {
      const col = gridIndex % COLS
      const row = Math.floor(gridIndex / COLS)
      const x = START_X + col * (BLOCK_WIDTH + GAP_X)
      const y = START_Y + row * (BLOCK_HEIGHT + GAP_Y)
      positions.set(block.id, [x, y])
      gridIndex++
    }
  }

  return positions
}
