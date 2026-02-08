import alchemy, { type Scope } from "alchemy"
import { CloudflareStateStore, FileSystemStateStore } from "alchemy/state"
import { D1Database, Worker, TanStackStart } from "alchemy/cloudflare"
import { Exec } from "alchemy/os"
import { config } from "dotenv"
import { Schema } from "effect"
import { EnvSchema as ApiEnvSchema } from "api/env"

config({ path: "./.env" })
config({ path: "./apps/api/.env" })
config({ path: "./apps/web/.env" })

const AlchemyEnvSchema = Schema.Struct({
  ALCHEMY_PASSWORD: Schema.String.pipe(Schema.minLength(1)),
  ALCHEMY_STAGE: Schema.Literal("dev", "main").pipe(
    Schema.optional,
    Schema.withDefaults({
      decoding: () => "dev" as const,
      constructor: () => "dev" as const,
    }),
  ),
  ALCHEMY_REMOTE_STATE: Schema.Literal("true", "false").pipe(
    Schema.optional,
    Schema.withDefaults({
      decoding: () => "false" as const,
      constructor: () => "false" as const,
    }),
  ),
})

const RemoteEnvSchema = Schema.Struct({
  WEB_DOMAIN: Schema.String.pipe(Schema.minLength(1)),
  API_DOMAIN: Schema.String.pipe(Schema.minLength(1)),
})

const alchemyEnvRaw = Schema.decodeUnknownSync(AlchemyEnvSchema)(process.env)
const alchemyEnv = {
  ...alchemyEnvRaw,
  ALCHEMY_REMOTE_STATE: alchemyEnvRaw.ALCHEMY_REMOTE_STATE === "true",
}

const apiEnv = Schema.decodeUnknownSync(ApiEnvSchema)(process.env)
const remoteEnv =
  alchemyEnv.ALCHEMY_REMOTE_STATE ?
    Schema.decodeUnknownSync(RemoteEnvSchema)(process.env)
  : null

const app = await alchemy("starter-effect", {
  password: alchemyEnv.ALCHEMY_PASSWORD,
  stage: alchemyEnv.ALCHEMY_STAGE,
  stateStore: (scope: Scope) =>
    remoteEnv ?
      new CloudflareStateStore(scope)
    : new FileSystemStateStore(scope),
})

await Exec("db-generate", {
  command: "pnpm run db:generate",
})

const db = await D1Database("db", {
  migrationsDir: "./migrations/",
})

export const api = await Worker("api", {
  cwd: "./apps/api",
  entrypoint: "./src/main.ts",
  compatibility: "node",
  domains: remoteEnv ? [remoteEnv.API_DOMAIN] : [],
  bindings: {
    DB: db,
    API_CORS_ORIGIN: apiEnv.API_CORS_ORIGIN.href,
    API_BETTER_AUTH_SECRET: alchemy.secret(apiEnv.API_BETTER_AUTH_SECRET),
    API_BETTER_AUTH_URL: apiEnv.API_BETTER_AUTH_URL.href,
    API_GITHUB_CLIENT_ID: apiEnv.API_GITHUB_CLIENT_ID,
    API_GITHUB_CLIENT_SECRET: alchemy.secret(apiEnv.API_GITHUB_CLIENT_SECRET),
  },
})

export const web = await TanStackStart("web", {
  cwd: "./apps/web",
  compatibility: "node",
  domains: remoteEnv ? [remoteEnv.WEB_DOMAIN] : [],
})

console.log(`Web -> ${web.url}`)
console.log(`API -> ${api.url}`)

await app.finalize()
