import { betterAuth } from "better-auth"

export const createAuth = (env: Env) =>
  betterAuth({
    secret: env.API_BETTER_AUTH_SECRET,
    baseURL: env.API_BETTER_AUTH_URL,
    trustedOrigins: [env.API_CORS_ORIGIN],
    socialProviders: {
      github: {
        clientId: env.API_GITHUB_CLIENT_ID,
        clientSecret: env.API_GITHUB_CLIENT_SECRET,
      },
    },
  })
