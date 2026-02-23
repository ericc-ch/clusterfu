import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { Book, BookId, BookInsert, BookUpdate } from "shared/schema"
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../types/errors"

export class BooksRpcGroup extends RpcGroup.make(
  Rpc.make("BookGet", {
    payload: Schema.Struct({ id: BookId }),
    success: Book,
    error: Schema.Union(NotFoundError),
  }),
  Rpc.make("BooksList", {
    payload: Schema.Struct({}),
    success: Schema.Struct({ data: Schema.Array(Book) }),
  }),
  Rpc.make("BooksCreate", {
    payload: BookInsert,
    success: Book,
    error: Schema.Union(UnauthorizedError),
  }),
  Rpc.make("BooksUpdate", {
    payload: Schema.Struct({ id: BookId, data: BookUpdate }),
    success: Book,
    error: Schema.Union(UnauthorizedError, ValidationError, NotFoundError),
  }),
  Rpc.make("BooksDelete", {
    payload: Schema.Struct({ id: BookId }),
    success: Book,
    error: Schema.Union(UnauthorizedError, NotFoundError),
  }),
) {}
