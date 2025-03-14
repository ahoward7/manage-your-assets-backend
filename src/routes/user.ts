import { Router } from 'express'
import User from '../models/User'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { search } = req.query

    if (!search) {
      const users = await User.find()
      res.send(users)
      return
    }

    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    })

    res.send(users)
  }
  catch (error) {
    res.status(500).send(`Internal Server Error: ${error}`)
  }
})

router.post('/', (req, res) => {
  res.send('post')
})

router.put('/', (req, res) => {
  res.send('put')
})

router.delete('/', (req, res) => {
  res.send('delete')
})

export default router
