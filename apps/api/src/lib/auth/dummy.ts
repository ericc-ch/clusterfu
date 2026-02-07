import { type DB } from "better-auth/adapters/drizzle"
import { EnvSchema } from "../env"
import { makeAuth } from "./make"

// dummy auth because better-auth cli doesn't actually use tsconfig
// i have to split the make and dummy and main to avoid resolving db and schema
export const auth = makeAuth(
  new EnvSchema({
    API_BETTER_AUTH_SECRET: "dummy-secret",
    API_BETTER_AUTH_URL: new URL("http://localhost:1337"),
    API_CORS_ORIGIN: new URL("http://localhost:5173"),
  }),
  {} as DB,
)
