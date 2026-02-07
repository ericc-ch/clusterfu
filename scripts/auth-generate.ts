import { execSync } from "node:child_process"

const command = [
  "pnpm",
  "exec",
  "better-auth",
  "generate",
  "--yes",
  "--config",
  "./apps/api/src/lib/auth/dummy.ts",
  "--output",
  "./packages/shared/src/schema/auth.sql.ts",
]

execSync(command.join(" "), { stdio: "inherit" })
