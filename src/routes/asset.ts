import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.send('Assets route')
})

router.post('/import', (req, res) => {
  const excelFiles = req.body
  res.send(excelFiles)
})

export default router
