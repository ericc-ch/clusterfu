import { drizzle } from "drizzle-orm/d1"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"
import { Context } from "effect"
import { schema } from "shared/schema"

export type GenericSQLite = BaseSQLiteDatabase<
  "sync" | "async",
  unknown,
  typeof schema
>

export function createDB(d1: D1Database): GenericSQLite {
  return drizzle(d1, { schema })
}

export class Database extends Context.Tag("api/lib/db/Database")<
  Database,
  GenericSQLite
>() {}
