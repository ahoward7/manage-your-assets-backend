import { Router } from 'express'
import Profile from '../models/Profile'

const router = Router()

router.get('/profile', async (req, res) => {
  try {
    const { user } = req.query

    if (!user) {
      res.status(400).send('User id is required')
      return
    }

    const profile = await Profile.findOne({ user })

    if (!profile) {
      res.status(404).send('Profile not found')
      return
    }

    res.status(200).json(profile)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

router.post('/', (req, res) => {
  res.send('post')
})

router.put('/profile', async (req, res) => {
  try {
    const profile = req.body

    const potentialProfile = await Profile.findOne({ user: profile.user })

    if (potentialProfile) {
      const updatedProfile = await Profile.updateOne({ user: profile.user }, profile)

      if (updatedProfile) {
        res.status(200).send('Profile updated')
        return
      }

      res.status(500).send('Failed to update profile')
    }
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete('/', (req, res) => {
  res.send('delete')
})

export default router
