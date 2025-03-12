import { model, Schema } from 'mongoose'

const AssetSchemaSchema = new Schema({
  name: { type: String, required: true },
  zod: { type: Object, required: true },
})

export default model('AssetSchema', AssetSchemaSchema, 'assetSchemas')
