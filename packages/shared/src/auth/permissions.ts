import { createAccessControl } from "better-auth/plugins/access"

// Organization-level statements (for org plugin)
const orgStatements = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  question: ["create", "read", "update", "delete"],
  test: ["create", "read", "update", "delete"],
  attempt: ["create", "read"],
} as const

export const ac = createAccessControl(orgStatements)

// --- Organization Roles ---

export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  question: ["create", "read", "update", "delete"],
  test: ["create", "read", "update", "delete"],
  attempt: ["create", "read"],
})

export const admin = ac.newRole({
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  question: ["create", "read", "update", "delete"],
  test: ["create", "read", "update", "delete"],
  attempt: ["create", "read"],
})

export const teacher = ac.newRole({
  question: ["create", "read", "update"],
  test: ["create", "read", "update"],
  attempt: ["create", "read"],
})

export const student = ac.newRole({
  question: ["read"],
  test: ["read"],
  attempt: ["create", "read"],
})
