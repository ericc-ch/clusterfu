import * as sqlite from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const repositories = sqlite.sqliteTable(
  "repositories",
  {
    owner: sqlite.text().notNull(),
    repo: sqlite.text().notNull(),
    lastSyncAt: sqlite.integer().notNull().default(0),
    errorMessage: sqlite.text(),
    createdAt: sqlite.integer().notNull(),
    updatedAt: sqlite.integer().notNull(),
  },
  (table) => [sqlite.primaryKey({ columns: [table.owner, table.repo] })],
)

const RepoName = z.string().regex(/^[a-zA-Z0-9._-]+$/)

export const Repository = createSelectSchema(repositories, {
  owner: RepoName,
  repo: RepoName,
})

export type Repository = z.infer<typeof Repository>

export const RepositoryInsert = createInsertSchema(repositories, {
  owner: RepoName,
  repo: RepoName,
})

export type RepositoryInsert = z.infer<typeof RepositoryInsert>

export const RepositoryUpdate = createInsertSchema(repositories, {
  owner: RepoName,
  repo: RepoName,
}).partial()

export type RepositoryUpdate = z.infer<typeof RepositoryUpdate>
