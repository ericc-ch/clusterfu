import type { createAuth } from "./lib/auth"
import type { Database } from "./lib/db"

type EnvWithStorage = Env & {
  STORAGE: R2Bucket
}

type Auth = ReturnType<typeof createAuth>

export type HonoContext = {
  Bindings: EnvWithStorage
  Variables: {
    db: Database
    auth: Auth
    session: Awaited<ReturnType<Auth["api"]["getSession"]>>
  }
}
