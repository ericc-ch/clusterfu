import { Effect } from "effect"
import { EnvContext } from "../env"
import { makeAuth } from "./make"

export class Auth extends Effect.Service<Auth>()("api/lib/auth", {
  effect: Effect.gen(function* () {
    const env = yield* EnvContext
    return makeAuth(env)
  }),
}) {}
