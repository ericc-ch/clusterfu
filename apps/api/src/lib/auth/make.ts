import { betterAuth } from "better-auth"
import { type EnvType } from "../env"

export const makeAuth = (env: EnvType) =>
  betterAuth({
    secret: env.API_BETTER_AUTH_SECRET,
    baseURL: env.API_BETTER_AUTH_URL.toString(),
    trustedOrigins: [env.API_CORS_ORIGIN.toString()],
    socialProviders: {
      github: {
        clientId: env.API_GITHUB_CLIENT_ID,
        clientSecret: env.API_GITHUB_CLIENT_SECRET,
      },
    },
  })
