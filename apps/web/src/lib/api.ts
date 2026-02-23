import { env } from "./env"
import { AppType } from "api"
import { hc } from "hono/client"

export const apiClient = hc<AppType>(env.VITE_API_URL)
