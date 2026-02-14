import { AtomRpc } from "@effect-atom/atom-react"
import { FetchHttpClient } from "@effect/platform"
import { RpcClient, RpcSerialization } from "@effect/rpc"
import { Layer } from "effect"
import { RootRpcGroup } from "api/rpc"
import { env } from "./env"

const protocolLayer = RpcClient.layerProtocolHttp({
  url: new URL("/rpc", env.VITE_API_URL).href,
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerJsonRpc()]))

export class RpcClientTag extends AtomRpc.Tag<RpcClientTag>()("RpcClient", {
  group: RootRpcGroup,
  protocol: protocolLayer,
}) {}
