import { Hono } from "hono"
import { cors } from "hono/cors"
import { createAuth } from "./lib/auth"
import { parseEnv, type Env } from "./lib/env"
import booksRoutes from "./routes/books"
import repositoriesRoutes from "./routes/repositories"

type Bindings = Env & { DB: D1Database }

const app = new Hono<{
  Bindings: Bindings
  Variables: { parsedEnv: Env }
}>()

app.use("*", async (c, next) => {
  const parsedEnv = parseEnv(c.env as unknown as Record<string, string>)
  c.set("parsedEnv", parsedEnv)
  return cors({
    origin: parsedEnv.API_CORS_ORIGIN,
    credentials: true,
  })(c, next)
})

app.get("/", (c) => c.text("i'm fine. thanks for asking. finally."))

app.use("/api/auth/*", async (c) => {
  const parsedEnv = c.get("parsedEnv")
  const auth = createAuth(parsedEnv)
  return auth.handler(c.req.raw)
})

app.route("/api/books", booksRoutes)
app.route("/api/repositories", repositoriesRoutes)

export type AppType = typeof app

export default app
