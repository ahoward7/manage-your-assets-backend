import mongoose, { model, Schema } from 'mongoose'

const ProfileSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['admin', 'employee', 'external'], required: true },
  supervisor: { type: String, required: false },
  employees: { type: [String], required: true },
})

export default model('Profile', ProfileSchema, 'profiles')
