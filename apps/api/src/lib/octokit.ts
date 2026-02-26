import { Octokit } from "octokit"
import type { HonoContext } from "../types"
import type { Context } from "hono"

export async function getOctokit(c: Context<HonoContext>): Promise<Octokit> {
  const tokenResponse = await c.var.auth.api.getAccessToken({
    headers: c.req.raw.headers,
    body: {
      providerId: "github",
    },
  })

  return new Octokit({ auth: tokenResponse.accessToken })
}
