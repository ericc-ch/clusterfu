/**
 * Uses Web Compression Streams API instead of Node.js zlib to avoid bundling
 * Node-only modules in the frontend.
 */

export async function compress(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function decompress(data: Uint8Array): Promise<string> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"))
  return new Response(stream).text()
}
