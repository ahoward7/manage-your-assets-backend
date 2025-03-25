export interface FileAsset {
  name: string
  filename: string
  type: string
  data: {
    data: any
    type: 'string' | 'base64' | 'binary' | 'buffer' | 'file' | 'array'
  }
}

export interface AssetInterface {
  schema: string
  category: string
  data: {
    _id: string
    schema: string
    [key: string]: AssetInterface | string | number | boolean | Date
  }
  created: Date
  updated: Date
  createdBy: string
  updatedBy: string
  owner: string
}

export interface CategorizedAssets {
  [key: string]: AssetCategory
}

export interface AssetCategory {
  name: string
  schema: string
  assets: AssetInterface[]
}
