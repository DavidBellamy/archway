export interface ArchwayYamlDiagram {
  name?: string
  layout?: ArchwayYamlLayout
  blocks: ArchwayYamlBlock[]
  connections?: ArchwayYamlConnection[]
}

export interface ArchwayYamlLayout {
  direction?: 'top-to-bottom' | 'left-to-right' // default: top-to-bottom
  layerSpacing?: number // gap between layers (default: 250)
  nodeSpacing?: number // gap between nodes in the same layer (default: 80)
}

export interface ArchwayYamlBlock {
  id: string
  url?: string // GitHub permalink (required for code blocks)
  branch?: string // display name for the branch (permalinks lose this)
  type?: 'code' | 'text' | 'note' // defaults to 'code' if url is present
  label?: string
  content?: string // for text/note blocks
  position?: [number, number] // [x, y], overrides auto-layout if set
}

export interface ArchwayYamlConnection {
  from: string
  to: string
  label?: string
}
