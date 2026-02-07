This codebase will outlive you. Every shortcut you take becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.

You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.

Fight entropy. Leave the codebase better than you found it.

## Workflow

Always explore the codebase first using grep/glob/read tools to understand the structure, then explore the .context/ directory to find relevant library source code. ONLY use documentation tools (documentation_resolve-library-id, documentation_query-docs) if the .context/ directory does not contain the library you need. Then load relevant skill when working on something.

## Architecture

Monorepo structure:

- apps/api: Hono + oRPC (Cloudflare Workers)
- apps/web: Vite + React + TanStack Router
- packages/shared: oRPC contracts, Drizzle schemas, Zod validation

Tech stack:

- Runtime: Cloudflare Workers deployed via Alchemy (no wrangler.toml)
- Database: SQLite via Cloudflare D1, Drizzle ORM
- Auth: Better Auth
- UI: Tailwind CSS v4, shadcn/ui (Base UI primitives), Lucide icons

References:

- apps/api/src/main.ts - API entry point
- apps/web/src/main.tsx - Web entry point
- packages/shared/src/contract/main.ts - oRPC contract definitions
- packages/shared/src/schema/main.ts - Drizzle schemas
- alchemy.run.ts - Cloudflare deployment config

## Context

The .context/ directory contains cloned repositories of libraries used in this project.
Prioritize reading source code here over using external documentation tools.

- Run `pnpm run prepare` to clone/update repos (runs automatically on install)
- Configure repos in scripts/context-pull.ts

## Development

Commands:

- pnpm run dev - Start all services via Alchemy
- pnpm run typecheck - Run TypeScript checks
- pnpm run test - Run Vitest (in apps/api/, single file: vitest path/to/file.test.ts)
- pnpm run lint - Lint with oxlint
- pnpm run format - Format with Prettier

Always run typecheck, test, and lint after making changes.

Git commits use conventional format: type: description (all lowercase, concise, no body)
Always break down large changes into multiple focused atomic commits.

## Coding Standards

- Minimize explicit types - Let TypeScript infer types wherever possible; only annotate when inference fails or for public API boundaries. With Effect, you almost never need explicit types - trust the inference.
- No semicolons - Prettier enforces semi: false
- Strict TypeScript - strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes enabled
- ESM only - Use import/export, no CommonJS
- Imports order - External deps, workspace packages, relative imports; type imports use `import type`
- Named exports - Prefer named exports over default exports
- Naming - camelCase for variables/functions, PascalCase for types/components, kebab-case for files
- No index.ts - Use main.ts instead (explicit names are easier to find)
- Error handling - Use ORPCError for RPC errors; check .at(0) results before returning
