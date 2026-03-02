import { describe, expect, it } from "vitest"
import { compress, decompress } from "./compression"

describe("compress", () => {
  it("compresses text to smaller size", async () => {
    const text = "Hello World! ".repeat(100)

    const compressed = await compress(text)

    expect(compressed.byteLength).toBeLessThan(text.length)
  })

  it("handles empty string", async () => {
    const compressed = await compress("")

    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.byteLength).toBeGreaterThan(0)
  })

  it("handles unicode text", async () => {
    const text = "Hello 世界 🌍 émojis"

    const compressed = await compress(text)

    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.byteLength).toBeGreaterThan(0)
  })
})

describe("decompress", () => {
  it("restores original text from compressed data", async () => {
    const original = "Hello World! This is a test message."
    const compressed = await compress(original)

    const restored = await decompress(compressed)

    expect(restored).toBe(original)
  })

  it("handles empty string round-trip", async () => {
    const original = ""
    const compressed = await compress(original)

    const restored = await decompress(compressed)

    expect(restored).toBe(original)
  })

  it("handles large text round-trip", async () => {
    const original = JSON.stringify({ data: "x".repeat(10000) })
    const compressed = await compress(original)

    const restored = await decompress(compressed)

    expect(restored).toBe(original)
  })

  it("handles unicode text round-trip", async () => {
    const original = "Hello 世界 🌍 émojis and special chars: ñ 中文 العربية"
    const compressed = await compress(original)

    const restored = await decompress(compressed)

    expect(restored).toBe(original)
  })
})

describe("compression round-trip", () => {
  it("preserves JSON data integrity", async () => {
    const data = {
      repo: "owner/repo",
      syncedAt: Date.now(),
      issues: {
        "issue-1": {
          id: "1",
          number: 42,
          state: "open" as const,
          vector: [0.1, 0.2],
        },
      },
    }
    const json = JSON.stringify(data)

    const compressed = await compress(json)
    const restored = await decompress(compressed)

    expect(JSON.parse(restored)).toEqual(data)
  })
})
