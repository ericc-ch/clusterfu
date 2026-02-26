import { createMiddleware } from "hono/factory"
import type { HonoContext } from "../types"

export const protectedMiddleware = createMiddleware<HonoContext>(async (c, next) => {
  const session = await c.var.auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  c.set("session", session)

  return await next()
})
