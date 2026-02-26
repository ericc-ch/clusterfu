export type Issue = {
  id: string
  number: number
  title: string
  bodyText: string
  state: "OPEN" | "CLOSED"
}

export type PullRequest = {
  id: string
  number: number
  title: string
  bodyText: string
  state: "OPEN" | "CLOSED" | "MERGED"
  files: {
    nodes: Array<{ path: string }>
  }
}

export type GraphQLResponse = {
  repository: {
    issues: {
      nodes: Array<Issue>
    }
    pullRequests: {
      nodes: Array<PullRequest>
    }
  }
}

export const FETCH_REPO_DATA_QUERY = /* GraphQL */ `
  query (
    $owner: String!
    $repo: String!
    $issuesFirst: Int!
    $issuesSince: DateTime
    $pullRequestsFirst: Int!
    $pullRequestsFilesFirst: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      issues(
        first: $issuesFirst
        filterBy: { states: OPEN, since: $issuesSince }
      ) {
        nodes {
          id
          number
          title
          bodyText
          state
        }
      }
      pullRequests(first: $pullRequestsFirst, states: OPEN) {
        nodes {
          id
          number
          title
          bodyText
          state
          files(first: $pullRequestsFilesFirst) {
            nodes {
              path
            }
          }
        }
      }
    }
  }
`
