import { Hono } from "hono"
import { cors } from "hono/cors"
import { createAuth } from "./lib/auth"
import { createDB, type Database } from "./lib/db"

import booksRoutes from "./routes/books"
import repositoriesRoutes from "./routes/repositories"

const app = new Hono<{
  Bindings: Env
  Variables: { db: Database }
}>()
  .use("*", async (c, next) => {
    const middleware = cors({
      origin: c.env.API_CORS_ORIGIN,
      credentials: true,
    })

    return middleware(c, next)
  })
  .use("*", async (c, next) => {
    c.set("db", createDB(c.env.DB))
    return await next()
  })
  .get("/", (c) => c.text("ok"))
  .on(["POST", "GET"], "/api/auth/*", async (c) => {
    const auth = createAuth(c.env)
    return auth.handler(c.req.raw)
  })
  .route("/api/books", booksRoutes)
  .route("/api/repositories", repositoriesRoutes)

export type AppType = typeof app

export default {
  fetch: app.fetch,
}
