import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRoutes from "./routes/user"
import accountRoutes from "./routes/account"
import profileRoutes from "./routes/profile"

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

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

app.use("/user", userRoutes)
app.use("/account", accountRoutes)
app.use("/profile", profileRoutes)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
