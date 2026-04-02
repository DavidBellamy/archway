export interface ArchwayYamlDiagram {
  name?: string
  blocks: ArchwayYamlBlock[]
  connections?: ArchwayYamlConnection[]
}

export interface ArchwayYamlBlock {
  id: string
  url?: string // GitHub permalink (required for code blocks)
  type?: 'code' | 'text' | 'note' // defaults to 'code' if url is present
  label?: string
  content?: string // for text/note blocks
  position?: [number, number] // [x, y], auto-layout if omitted
}

export interface ArchwayYamlConnection {
  from: string
  to: string
  label?: string
}
