import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./packages/shared/src/schema/*.sql.ts",
  out: "./migrations",
})
