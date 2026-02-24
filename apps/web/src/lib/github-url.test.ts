import {
  GITHUB_SHORTHAND_REGEX,
  GITHUB_URL_REGEX,
  isValidGitHubRepoUrl,
} from "./github-url"
import { describe, expect, it } from "vitest"

describe("isValidGitHubRepoUrl", () => {
  it("validates full GitHub URLs", () => {
    expect(isValidGitHubRepoUrl("https://github.com/owner/repo")).toBe(true)
    expect(isValidGitHubRepoUrl("https://github.com/owner/repo/")).toBe(true)
    expect(isValidGitHubRepoUrl("https://github.com/vercel/next.js")).toBe(true)
    expect(isValidGitHubRepoUrl("https://github.com/my-org/my_repo")).toBe(true)
  })

  it("validates shorthand GitHub references", () => {
    expect(isValidGitHubRepoUrl("owner/repo")).toBe(true)
    expect(isValidGitHubRepoUrl("vercel/next.js")).toBe(true)
    expect(isValidGitHubRepoUrl("my-org/my_repo")).toBe(true)
  })

  it("rejects invalid URLs", () => {
    expect(isValidGitHubRepoUrl("")).toBe(false)
    expect(isValidGitHubRepoUrl("github.com/owner/repo")).toBe(false)
    expect(isValidGitHubRepoUrl("https://github.com/owner")).toBe(false)
    expect(isValidGitHubRepoUrl("https://github.com/")).toBe(false)
    expect(isValidGitHubRepoUrl("https://gitlab.com/owner/repo")).toBe(false)
    expect(isValidGitHubRepoUrl("owner")).toBe(false)
    expect(isValidGitHubRepoUrl("/repo")).toBe(false)
  })
})

describe("GITHUB_URL_REGEX", () => {
  it("matches full GitHub URLs", () => {
    expect(GITHUB_URL_REGEX.test("https://github.com/owner/repo")).toBe(true)
    expect(GITHUB_URL_REGEX.test("https://github.com/owner/repo/")).toBe(true)
  })

  it("does not match shorthand", () => {
    expect(GITHUB_URL_REGEX.test("owner/repo")).toBe(false)
  })
})

describe("GITHUB_SHORTHAND_REGEX", () => {
  it("matches shorthand references", () => {
    expect(GITHUB_SHORTHAND_REGEX.test("owner/repo")).toBe(true)
  })

  it("does not match full URLs", () => {
    expect(GITHUB_SHORTHAND_REGEX.test("https://github.com/owner/repo")).toBe(
      false,
    )
  })
})
