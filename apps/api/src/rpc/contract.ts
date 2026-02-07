import { RpcGroup } from "@effect/rpc"
import { BooksRpcGroup } from "./books/contract"
export * from "./errors"

export const RootRpcGroup = RpcGroup.make().merge(BooksRpcGroup)
