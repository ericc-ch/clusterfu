import { createAuthClient } from "better-auth/react"
import { env } from "./env"

export const auth = createAuthClient({
  baseURL: new URL("/api/auth", env.VITE_API_URL).href,
})
