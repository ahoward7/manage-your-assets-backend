import mongoose, { model, Schema } from 'mongoose'

const AssetSchema = new Schema({
  schema: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetSchema' },
  data: { type: Object, required: true },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

export default model('AssetSchema', AssetSchema, 'assetSchemas')
