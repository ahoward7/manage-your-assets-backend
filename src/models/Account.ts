import mongoose, { model, Schema } from 'mongoose'

const AccountSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  client: { type: String, enum: ['google', 'mya', 'merged'], required: true },
  email: { type: String, required: true },
  image: { type: String, required: false },
  password: { type: String, required: false },
})

export default model('Account', AccountSchema, 'accounts')
