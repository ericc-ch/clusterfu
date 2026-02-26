import { zValidator } from "@hono/zod-validator"
import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"
import { parseGitHubRepoUrl, repositories as repositoriesTable } from "shared"
import { generateEmbeddings, prepIssue, prepPullRequest } from "../../lib/embedding"
import { protectedMiddleware } from "../../middleware/protected"
import type { HonoContext } from "../../types"
import { FETCH_REPO_DATA_QUERY, type GraphQLResponse } from "./queries"

const submitSchema = z.object({
  repoUrl: z.string().min(1),
})

interface IssueVector {
  id: string
  number: number
  state: "open" | "closed"
  vector: number[]
}

interface PullRequestVector extends IssueVector {
  hash: string
}

interface VectorObject {
  repo: string
  syncedAt: number
  issues: { [id: string]: IssueVector }
  pullRequests: { [id: string]: PullRequestVector }
}

async function compressGzip(text: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const compressed = await new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(data)
        controller.close()
      },
    }).pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer()
  return compressed
}

async function decompressGzip(buffer: ArrayBuffer): Promise<string> {
  const decompressed = await new Response(
    new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip")),
  ).arrayBuffer()
  const decoder = new TextDecoder()
  return decoder.decode(decompressed)
}

async function computeHash(title: string, body: string, filePaths: string[]): Promise<string> {
  const content = title + "\n\n" + body + "\n\n" + filePaths.join("\n")
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export const repositoriesRoutes = new Hono<HonoContext>()
  .get("/", async (c) => {
    const db = c.get("db")
    const data = await db.select().from(repositoriesTable)
    return c.json({ data })
  })
  .get("/:owner/:repo", async (c) => {
    const owner = c.req.param("owner")
    const repo = c.req.param("repo")
    const db = c.get("db")
    const repoData = await db
      .select()
      .from(repositoriesTable)
      .where(and(eq(repositoriesTable.owner, owner), eq(repositoriesTable.repo, repo)))
      .limit(1)
    const result = repoData.at(0)
    if (!result) {
      return c.json({ error: "Repository not found" }, 404)
    }
    return c.json(result)
  })
  .post("/", protectedMiddleware, zValidator("json", submitSchema), async (c) => {
    const { repoUrl } = c.req.valid("json")
    const parseResult = parseGitHubRepoUrl(repoUrl)

    if ("error" in parseResult) {
      return c.json({ error: parseResult.error }, 400)
    }

    const { owner, repo: repoName } = parseResult
    const db = c.get("db")

    const existing = await db
      .select()
      .from(repositoriesTable)
      .where(and(eq(repositoriesTable.owner, owner), eq(repositoriesTable.repo, repoName)))
      .limit(1)

    const existingRepo = existing.at(0)
    if (existingRepo) {
      return c.json(existingRepo)
    }

    const now = Date.now()
    const inserted = await db
      .insert(repositoriesTable)
      .values({
        owner,
        repo: repoName,
        status: "pending",
        lastSyncAt: 0,
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    const newRepo = inserted.at(0)
    if (!newRepo) {
      return c.json({ error: "Failed to create repository entry" }, 500)
    }

    return c.json(newRepo, 201)
  })
  .post("/:owner/:repo/sync", protectedMiddleware, async (c) => {
    const owner = c.req.param("owner")
    const repo = c.req.param("repo")
    const fullRepoName = `${owner}/${repo}`

    const db = c.get("db")
    const storage = c.env.STORAGE

    // Check if already syncing
    const repoData = await db
      .select()
      .from(repositoriesTable)
      .where(and(eq(repositoriesTable.owner, owner), eq(repositoriesTable.repo, repo)))
      .limit(1)

    const repository = repoData.at(0)
    if (!repository) {
      return c.json({ error: "Repository not found" }, 404)
    }

    if (repository.status === "syncing" || repository.status === "backfilling") {
      return c.json({ error: "Sync already in progress" }, 409)
    }

    const octokit = c.get("octokit")
    if (!octokit) {
      return c.json({ error: "No GitHub account linked" }, 400)
    }

    // Set status to syncing
    await db
      .update(repositoriesTable)
      .set({ status: "syncing", updatedAt: Date.now() })
      .where(and(eq(repositoriesTable.owner, owner), eq(repositoriesTable.repo, repo)))

    try {
      const since = repository.lastSyncAt > 0 ? new Date(repository.lastSyncAt).toISOString() : null

      // Fetch existing vector object from R2 if it exists
      const objectKey = `${owner}/${repo}.json.gz`
      let existingVectorObject: VectorObject | null = null
      const existingData = await storage?.get(objectKey)
      if (existingData) {
        const decompressed = await decompressGzip(await existingData.arrayBuffer())
        existingVectorObject = JSON.parse(decompressed) as VectorObject
      }

      // Fetch from GitHub
      const { repository: githubRepo } = await octokit.graphql<GraphQLResponse>(
        FETCH_REPO_DATA_QUERY,
        {
          owner,
          repo,
          issuesFirst: 1,
          issuesSince: since,
          pullRequestsFirst: 1,
          pullRequestsFilesFirst: 100,
        },
      )

      const issue = githubRepo.issues.nodes.at(0)
      const pullRequest = githubRepo.pullRequests.nodes.at(0)

      // Build the vector object
      const mergedIssues: { [id: string]: IssueVector } = existingVectorObject?.issues ?? {}
      const mergedPullRequests: { [id: string]: PullRequestVector } =
        existingVectorObject?.pullRequests ?? {}

      // Collect items that need embedding
      const itemsToEmbed: Array<{
        type: "issue" | "pr"
        item: typeof issue | typeof pullRequest
        prepFn: () => string
      }> = []

      if (issue && issue.state === "OPEN") {
        itemsToEmbed.push({
          type: "issue",
          item: issue,
          prepFn: () => prepIssue(issue),
        })
      }

      if (pullRequest) {
        const filePaths = pullRequest.files.nodes.map((f) => f.path)
        const hash = await computeHash(pullRequest.title, pullRequest.bodyText, filePaths)
        const existingPR = mergedPullRequests[pullRequest.id]

        // Only embed if hash changed or new PR
        if (!existingPR || existingPR.hash !== hash) {
          itemsToEmbed.push({
            type: "pr",
            item: pullRequest,
            prepFn: () => prepPullRequest(pullRequest),
          })
        }
      }

      // Generate embeddings for items that need them
      const textsToEmbed = itemsToEmbed.map((i) => i.prepFn())
      const embeddings: number[][] =
        textsToEmbed.length > 0 ? await generateEmbeddings(textsToEmbed) : []

      // Process issue
      if (issue) {
        if (issue.state === "OPEN") {
          const embeddingIndex = itemsToEmbed.findIndex(
            (i) => i.type === "issue" && i.item?.id === issue.id,
          )
          const vector =
            embeddingIndex >= 0
              ? embeddings[embeddingIndex]
              : existingVectorObject?.issues[issue.id]?.vector
          if (vector) {
            mergedIssues[issue.id] = {
              id: issue.id,
              number: issue.number,
              state: "open",
              vector,
            }
          }
        } else {
          // Closed issue - remove from object
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete mergedIssues[issue.id]
        }
      }

      // Process PR
      if (pullRequest) {
        const filePaths = pullRequest.files.nodes.map((f) => f.path)
        const hash = await computeHash(pullRequest.title, pullRequest.bodyText, filePaths)
        const existingPR = mergedPullRequests[pullRequest.id]

        if (!existingPR || existingPR.hash !== hash) {
          const embeddingIndex = itemsToEmbed.findIndex(
            (i) => i.type === "pr" && i.item?.id === pullRequest.id,
          )
          const vector =
            embeddingIndex >= 0
              ? embeddings[embeddingIndex]
              : existingVectorObject?.pullRequests[pullRequest.id]?.vector
          if (vector) {
            mergedPullRequests[pullRequest.id] = {
              id: pullRequest.id,
              number: pullRequest.number,
              state: pullRequest.state === "OPEN" ? "open" : "closed",
              hash,
              vector,
            }
          }
        }
      }

      // Build final vector object
      const vectorObject: VectorObject = {
        repo: fullRepoName,
        syncedAt: Date.now(),
        issues: mergedIssues,
        pullRequests: mergedPullRequests,
      }

      // Compress and write to R2
      const json = JSON.stringify(vectorObject)
      const compressed = await compressGzip(json)
      await storage?.put(objectKey, compressed, {
        httpMetadata: { contentType: "application/gzip" },
      })

      // Update D1 status to active
      await db
        .update(repositoriesTable)
        .set({
          status: "active",
          lastSyncAt: Date.now(),
          updatedAt: Date.now(),
          errorMessage: null,
        })
        .where(and(eq(repositoriesTable.owner, owner), eq(repositoriesTable.repo, repo)))

      return c.json({
        repo: fullRepoName,
        status: "active",
        lastSyncAt: vectorObject.syncedAt,
        issuesCount: Object.keys(mergedIssues).length,
        pullRequestsCount: Object.keys(mergedPullRequests).length,
      })
    } catch (error) {
      // Update status to error
      await db
        .update(repositoriesTable)
        .set({
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          updatedAt: Date.now(),
        })
        .where(and(eq(repositoriesTable.owner, owner), eq(repositoriesTable.repo, repo)))

      return c.json(
        {
          error: "Sync failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      )
    }
  })
