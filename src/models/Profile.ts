import mongoose, { model, Schema } from 'mongoose'

const ProfileSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['admin', 'supervisor', 'employee', 'external', ''] },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employees: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' },
  completed: { type: Boolean, default: false },
})

export default model('Profile', ProfileSchema, 'profiles')
