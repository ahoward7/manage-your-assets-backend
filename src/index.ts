import type { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import accountRoutes from './routes/account'
import assetRoutes from './routes/asset'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import userRoutes from './routes/user'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

const mongoUri = process.env.MONGO_URI || ''

mongoose.connect(mongoUri).then(() => {
  console.info('MongoDB connected')
}).catch((error) => {
  console.error('MongoDB connection error:', error)
})

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}))

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <html>
      <body>
        <h1>API</h1>
        <ul>
          <li><a href="/user">User</a></li>
          <li><a href="/account">Account</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
      </body>
    </html>
  `)
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/user', userRoutes)
app.use('/account', accountRoutes)
app.use('/profile', profileRoutes)
app.use('/auth', authRoutes)
app.use('/asset', assetRoutes)

app.listen(port, () => {
  console.info(`[server]: Server is running at http://localhost:${port}`)
})
