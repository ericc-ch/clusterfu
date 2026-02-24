const githubUrlRegex =
  /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/
const githubShorthandRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/

export const GITHUB_URL_REGEX = githubUrlRegex
export const GITHUB_SHORTHAND_REGEX = githubShorthandRegex

export function isValidGitHubRepoUrl(url: string): boolean {
  return githubUrlRegex.test(url) || githubShorthandRegex.test(url)
}
