import { Headers } from "@effect/platform"
import { Effect } from "effect"
import { Auth } from "../../lib/auth/main"
import { UnauthorizedError } from "../../types/errors"

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

export const getGitHubAccessToken = (headers: Headers.Headers) =>
  Effect.gen(function* () {
    const auth = yield* Auth

    const tokenResult = yield* Effect.promise(() =>
      auth.api.getAccessToken({
        headers,
        body: { providerId: "github" },
      }),
    )

    if (!tokenResult || "error" in tokenResult) {
      return yield* new UnauthorizedError({
        message: "Failed to get GitHub access token",
      })
    }

    console.log("GitHub Access Token:", tokenResult.accessToken)

    return tokenResult.accessToken
  })
