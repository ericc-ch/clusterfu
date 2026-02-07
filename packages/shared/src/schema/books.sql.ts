import * as sqlite from "drizzle-orm/sqlite-core"
import { Schema } from "effect"

export const books = sqlite.sqliteTable("books", {
  id: sqlite.integer().primaryKey({ autoIncrement: true }),
  title: sqlite.text().notNull(),
  author: sqlite.text().notNull(),
})

export const BookId = Schema.Number.pipe(Schema.int(), Schema.positive())

export class Book extends Schema.Class<Book>("Book")({
  id: BookId,
  title: Schema.String,
  author: Schema.String,
}) {}

export const BookInsert = Schema.Struct(Book.fields).pipe(Schema.omit("id"))
export const BookUpdate = Schema.partial(BookInsert)
