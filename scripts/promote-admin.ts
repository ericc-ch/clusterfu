#!/usr/bin/env -S pnpx tsx

import { execSync } from "node:child_process"
import { globSync, statSync } from "node:fs"
import { createClient } from "@libsql/client"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const argv = await yargs(hideBin(process.argv))
  .option("email", {
    alias: "e",
    type: "string",
    description: "Email of user to promote",
    demandOption: true,
  })
  .option("remote", {
    alias: "r",
    type: "boolean",
    description: "Target remote D1 via wrangler",
    default: false,
  })
  .option("stage", {
    alias: "s",
    type: "string",
    description: "Stage for remote D1 (dev/main)",
    default: "dev",
  })
  .option("dry-run", {
    alias: "d",
    type: "boolean",
    description: "Print actions without executing",
    default: false,
  })
  .example("$0 -e admin@test.com", "Promote local user to admin")
  .example(
    "$0 -e admin@prod.com --remote --stage main",
    "Promote remote user to admin",
  )
  .help()
  .parseAsync()

// Validate inputs
if (!argv.email.includes("@")) {
  console.error("Error: Invalid email format")
  process.exit(1)
}

const dryRun = argv.dryRun
const remote = argv.remote
const stage = argv.stage
const email = argv.email
const dbName = `starter-effect-db-${stage}`

// Helper: get local SQLite path
function getLocalDbPath(): string {
  const sqliteFiles = globSync(
    ".alchemy/miniflare/v3/d1/**/*.sqlite",
    // Exclude WAL and SHM files
  ).filter((f) => !f.endsWith("-wal") && !f.endsWith("-shm"))

  if (sqliteFiles.length === 0) {
    console.error("Error: No local database found. Run 'pnpm dev' first.")
    process.exit(1)
  }

  // If multiple, pick most recently modified
  if (sqliteFiles.length > 1) {
    sqliteFiles.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
  }

  return sqliteFiles[0]!
}

// Helper: query local DB
async function queryLocal(
  sql: string,
  args: (string | number)[] = [],
): Promise<Record<string, unknown>[]> {
  const dbPath = getLocalDbPath()
  const client = createClient({ url: `file:${dbPath}` })
  const result = await client.execute({ sql, args })
  return result.rows as Record<string, unknown>[]
}

// Helper: execute local DB
async function executeLocal(
  sql: string,
  args: (string | number)[] = [],
): Promise<void> {
  const dbPath = getLocalDbPath()
  const client = createClient({ url: `file:${dbPath}` })
  await client.execute({ sql, args })
}

// Helper: query remote DB via wrangler
function queryRemote(sql: string): Record<string, unknown>[] {
  try {
    const output = execSync(
      `pnpx wrangler d1 execute ${dbName} --remote --json --command "${sql}"`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
    )
    const parsed = JSON.parse(output) as {
      results?: Record<string, unknown>[]
    }[]
    return parsed[0]?.results ?? []
  } catch {
    return []
  }
}

// Helper: execute remote DB via wrangler
function executeRemote(sql: string): void {
  execSync(`pnpx wrangler d1 execute ${dbName} --remote --command "${sql}"`, {
    stdio: "inherit",
  })
}

// Step 1: Check if user exists
console.log(`Checking if user exists: ${email}`)

let existingUser: { id: string; role: string | null } | undefined

if (remote) {
  const rows = queryRemote(`SELECT id, role FROM users WHERE email='${email}'`)
  if (rows.length > 0) {
    existingUser = rows[0] as { id: string; role: string | null }
  }
} else {
  const rows = await queryLocal("SELECT id, role FROM users WHERE email = ?", [
    email,
  ])
  if (rows.length > 0) {
    existingUser = rows[0] as { id: string; role: string | null }
  }
}

// Step 2: Validate user exists
if (!existingUser) {
  console.error(`Error: User not found: ${email}`)
  console.error("The user must sign up first before being promoted to admin.")
  process.exit(1)
}

if (existingUser.role === "admin") {
  console.log(`User is already admin: ${email}`)
  process.exit(0)
}

// Step 3: Update role to admin
const updateSql = `UPDATE users SET role='admin' WHERE email='${email}'`

if (dryRun) {
  console.log(`[DRY RUN] Would execute: ${updateSql}`)
} else {
  console.log(`Promoting to admin: ${email}`)

  if (remote) {
    executeRemote(updateSql)
  } else {
    await executeLocal("UPDATE users SET role='admin' WHERE email = ?", [email])
  }

  console.log(`User promoted to admin: ${email}`)
}
