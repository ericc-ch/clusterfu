import { createAuth } from "./auth"

// dummy auth because better-auth cli doesn't actually use tsconfig
// i have to split the make and dummy and main to avoid resolving db and schema
export const auth = createAuth({
  API_BETTER_AUTH_SECRET: "dummy-secret",
  API_BETTER_AUTH_URL: "http://localhost:1337",
  API_CORS_ORIGIN: "http://localhost:5173",
  API_GITHUB_CLIENT_ID: "dummy-client-id",
  API_GITHUB_CLIENT_SECRET: "dummy-client-secret",
})
