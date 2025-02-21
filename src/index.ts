import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRoutes from "./routes/user"
import accountRoutes from "./routes/account"
import profileRoutes from "./routes/profile"
import authRoutes from "./routes/auth"
import mongoose from "mongoose"

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

const mongoUri = process.env.MONGO_URI || ''

mongoose.connect(mongoUri).then(() => {
  console.log('MongoDB connected')
}).catch((error) => {
  console.error('MongoDB connection error:', error)
})

app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}))

app.get("/", (req: Request, res: Response) => {
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

app.use("/user", userRoutes)
app.use("/account", accountRoutes)
app.use("/profile", profileRoutes)
app.use("/auth", authRoutes)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
