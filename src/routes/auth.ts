import { Router } from 'express'

const router = Router()

router.post('/google', (req, res) => {
  res.send('google login')
})

router.post('/login', (req, res) => {
  console.log(req.body)
  res.send(req.body)
})

router.post('/register', (req, res) => {
  res.send('register')
})

router.put('/user/:id', (req, res) => {
  res.send('update user information')
})

router.put('/account/:id', (req, res) => {
  res.send('update account information')
})

export default router
