export interface FileAsset {
  name: string
  filename: string
  type: string
  data: {
    data: any
    type: 'string' | 'base64' | 'binary' | 'buffer' | 'file' | 'array'
  }
}
