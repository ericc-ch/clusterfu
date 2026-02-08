import { Context, Schema } from "effect"

export class EnvSchema extends Schema.Class<EnvSchema>("EnvSchema")({
  API_CORS_ORIGIN: Schema.URL.pipe(
    Schema.optional,
    Schema.withDefaults({
      decoding: () => new URL("http://localhost:5173"),
      constructor: () => new URL("http://localhost:5173"),
    }),
  ),
  API_BETTER_AUTH_SECRET: Schema.String.pipe(Schema.minLength(1)),
  API_BETTER_AUTH_URL: Schema.URL.pipe(
    Schema.optional,
    Schema.withDefaults({
      decoding: () => new URL("http://localhost:1337"),
      constructor: () => new URL("http://localhost:1337"),
    }),
  ),
  API_GITHUB_CLIENT_ID: Schema.String.pipe(Schema.minLength(1)),
  API_GITHUB_CLIENT_SECRET: Schema.String.pipe(Schema.minLength(1)),
}) {}

export type EnvType = typeof EnvSchema.Type

export class EnvContext extends Context.Tag("api/lib/env/EnvContext")<
  EnvContext,
  EnvType
>() {}
