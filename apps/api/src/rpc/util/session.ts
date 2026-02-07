import { Headers } from "@effect/platform"
import { Effect } from "effect"
import { Auth } from "../../lib/auth/main"
import { UnauthorizedError } from "../errors"

export const getSession = (headers: Headers.Headers) =>
  Effect.gen(function* () {
    const auth = yield* Auth

    const session = yield* Effect.promise(() =>
      auth.api.getSession({ headers }),
    )

    if (!session) {
      return yield* new UnauthorizedError({ message: "Unauthorized" })
    }

    return session
  })
