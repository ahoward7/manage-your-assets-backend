import { model, Schema } from 'mongoose'

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: false },
})

export default model('User', UserSchema, 'users')
