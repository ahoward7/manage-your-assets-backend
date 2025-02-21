import { Router } from 'express'
import Account from '../models/Account'
import User from '../models/User'
import { LoginForm } from '../../interfaces/auth'

const router = Router()

router.post('/google', (req, res) => {
  res.send('google login')
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const potentialAccount = await Account.findOne({ email })

    if (!potentialAccount) {
      res.status(404).send('Account not found')
      return
    }

    if (potentialAccount.password !== password) {
      res.status(401).send('Invalid credentials')
      return
    }

    res.json(potentialAccount)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, image, client } = req.body as LoginForm
    const potentialAccount = await Account.findOne({ email })

    if (potentialAccount) {
      if (['merged', client].includes(potentialAccount.client)) {
        res.status(409).send('Account already exists')
        return
      }

      const mergedAccount = new Account({ ...potentialAccount, client: 'merged' })
      await Account.updateOne({ email }, mergedAccount)

      res.status(200).json(mergedAccount)
      return
    }

    const newUser = new User({ firstName, lastName, email, image })
    const newAccount = new Account({ user: newUser._id, firstName, lastName, email, password })

    newUser.save()
    newAccount.save()

    res.status(201).json(newUser)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

router.put('/user/:id', (req, res) => {
  res.send('update user information')
})

router.put('/account/:id', (req, res) => {
  res.send('update account information')
})

export default router
