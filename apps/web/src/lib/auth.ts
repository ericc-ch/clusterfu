import { createAuthClient } from "better-auth/client"
import { env } from "./env"

export const auth = createAuthClient({
  baseURL: env.VITE_API_URL + "/api/auth",
})
