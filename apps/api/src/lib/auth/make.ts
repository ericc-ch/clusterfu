import { betterAuth } from "better-auth"
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle"
import { type EnvType } from "../env"

export const makeAuth = (env: EnvType, db: DB) =>
  betterAuth({
    secret: env.API_BETTER_AUTH_SECRET,
    baseURL: env.API_BETTER_AUTH_URL.toString(),
    trustedOrigins: [env.API_CORS_ORIGIN.toString()],
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      camelCase: true,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
  })
