import { execSync } from "node:child_process"

const commands = [
  ["pnpm", "run", "auth:generate"],
  ["pnpm", "exec", "drizzle-kit", "generate"],
]

for (const command of commands) {
  execSync(command.join(" "), { stdio: "inherit" })
}
