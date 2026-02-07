Hono + oRPC (Cloudflare Workers)

## Dependency Injection

The API uses a DI pattern where services are created once at startup and passed through:

- `Env` (global) = Cloudflare bindings (DB, KV) from Alchemy
- `ParsedEnv` = Zod-validated app config (env vars like API_CORS_ORIGIN)
- Access bindings directly from cloudflareEnv.DB, env vars through services.env

References:

- apps/api/src/lib/services.ts
- apps/api/src/lib/env.ts
