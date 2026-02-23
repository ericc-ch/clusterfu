import { drizzle } from "drizzle-orm/d1"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"
import { schema } from "shared/schema"

export type GenericSQLite = BaseSQLiteDatabase<
  "sync" | "async",
  unknown,
  typeof schema
>

export type Database = GenericSQLite

export function createDB(d1: D1Database): GenericSQLite {
  return drizzle(d1, { schema })
}
