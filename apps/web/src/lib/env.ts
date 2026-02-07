import { Schema } from "effect"

const EnvSchema = Schema.Struct({
  VITE_API_URL: Schema.URL.pipe(
    Schema.optional,
    Schema.withDefaults({
      decoding: () => new URL("http://localhost:1337"),
      constructor: () => new URL("http://localhost:1337"),
    }),
  ),
})

export const env = Schema.decodeUnknownSync(EnvSchema)(import.meta.env)
