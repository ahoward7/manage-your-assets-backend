import { Router } from 'express'
import Account from '../models/Account'
import User from '../models/User'
import { LoginForm, GoogleAccount, BaseAccount, BaseUser, MyaUser } from '../../interfaces/auth'
import { $fetch } from 'ofetch'

function accountFromGoogleAccount(googleAccount: GoogleAccount): BaseAccount {
  return {
    user: '',
    client: 'google',
    email: googleAccount.email,
    password: '',
    isMerged: false,
  }
}

function userFromGoogleAccount(googleAccount: GoogleAccount): BaseUser {
  return {
    firstName: googleAccount.given_name,
    lastName: googleAccount.family_name,
    email: googleAccount.email,
    image: googleAccount.picture,
  }
}

const router = Router()

router.post('/google', async (req, res) => {
  try {
    const { access_token } = req.body

    const googleApi = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    const googleAccount = await $fetch(googleApi)

    const { email, picture } = googleAccount as GoogleAccount

    const potentialAccount = await Account.findOne({ email })

    if (!potentialAccount) {
      const userFromGoogle = userFromGoogleAccount(googleAccount)
      const accountFromGoogle = accountFromGoogleAccount(googleAccount)

      const newUser = new User(userFromGoogle)
      const newAccount = new Account({ ...accountFromGoogle, user: newUser._id })

      newUser.save()
      newAccount.save()

      res.status(201).json(newUser)
      return
    }

    if (potentialAccount.client === 'mya') {
      const mergedAccount = { ...potentialAccount.toObject(), client: 'merged' }

      await Account.updateOne({ email }, mergedAccount)
      await User.updateOne({ _id: potentialAccount.user }, { image: picture })

      res.status(200).json(mergedAccount)
      return
    }

    res.status(200).json(potentialAccount)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const potentialAccount = await Account.findOne({ email })

    if (!potentialAccount) {
      res.status(404).send('Account not found')
      return
    }

    if (potentialAccount.client === 'google') {
      res.status(409).send('Found google account')
      return
    }

    if (potentialAccount.password !== password) {
      res.status(401).send('Invalid credentials')
      return
    }

    const user = await User.findById(potentialAccount.user)

    if (!user) {
      res.status(404).send('User not found with this account')
      return
    }

    res.status(200).json(user)
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
      await User.updateOne({ _id: potentialAccount.user }, { firstName, lastName, email, image })

      const user = await User.findById(potentialAccount.user)

      res.status(200).json(user)
      return
    }

    const newUser = new User({ firstName, lastName, email, image })
    const newAccount = new Account({ user: newUser._id, email, password, client })

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
