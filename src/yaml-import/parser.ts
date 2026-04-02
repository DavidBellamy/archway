import yaml from 'js-yaml'
import type { ArchwayYamlDiagram, ArchwayYamlBlock, ArchwayYamlConnection } from './schema'

export function parseArchwayYaml(text: string): ArchwayYamlDiagram {
  const raw = yaml.load(text) as Record<string, unknown>

  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid YAML: expected an object at the root.')
  }

  const blocks = raw.blocks
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('YAML must have a non-empty "blocks" array.')
  }

  const validatedBlocks: ArchwayYamlBlock[] = blocks.map(
    (b: Record<string, unknown>, i: number) => {
      if (!b || typeof b !== 'object') {
        throw new Error(`Block at index ${i} must be an object.`)
      }
      if (typeof b.id !== 'string' || !b.id) {
        throw new Error(`Block at index ${i} must have a string "id".`)
      }

      const blockType = (b.type as string) ?? (b.url ? 'code' : 'text')

      if (blockType === 'code' && typeof b.url !== 'string') {
        throw new Error(
          `Code block "${b.id}" must have a "url" (GitHub permalink).`,
        )
      }

      if ((blockType === 'text' || blockType === 'note') && !b.content && !b.label) {
        throw new Error(
          `Block "${b.id}" (type: ${blockType}) must have "content" or "label".`,
        )
      }

      const position = Array.isArray(b.position)
        ? [Number(b.position[0]), Number(b.position[1])] as [number, number]
        : undefined

      return {
        id: b.id as string,
        url: b.url as string | undefined,
        type: blockType as 'code' | 'text' | 'note',
        label: b.label as string | undefined,
        content: b.content as string | undefined,
        position,
      }
    },
  )

  // Validate connections
  const blockIds = new Set(validatedBlocks.map((b) => b.id))
  const connections: ArchwayYamlConnection[] = []

  if (Array.isArray(raw.connections)) {
    for (const c of raw.connections as Record<string, unknown>[]) {
      if (!c || typeof c !== 'object') continue

      const from = c.from as string
      const to = c.to as string

      if (!from || !to) {
        throw new Error('Each connection must have "from" and "to" fields.')
      }
      if (!blockIds.has(from)) {
        throw new Error(`Connection references unknown block "${from}".`)
      }
      if (!blockIds.has(to)) {
        throw new Error(`Connection references unknown block "${to}".`)
      }

      connections.push({
        from,
        to,
        label: (c.label as string) ?? undefined,
      })
    }
  }

  return {
    name: (raw.name as string) ?? undefined,
    blocks: validatedBlocks,
    connections,
  }
}
