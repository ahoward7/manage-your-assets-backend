import { model, Schema } from 'mongoose'

const AssetSchema = new Schema({
  name: { type: String, required: true },
  zod: { type: Object, required: true },
})

export default model('AssetSchema', AssetSchema, 'assetSchemas')
