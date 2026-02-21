Vite + React + TanStack Start (SPA) + Effect RPC

## Effect RPC

Type-safe RPC via `@effect-atom/atom-react`.

**Queries (readonly):**

```typescript
import { useAtomValue } from "@effect-atom/atom-react"
import { RpcClientTag } from "@/lib/rpc"

const result = useAtomValue(RpcClientTag.query("methodName", payload))
// result is Result.Result<SuccessType>
```

**Mutations:**

```typescript
import { useAtomSet } from "@effect-atom/atom-react"
import { RpcClientTag } from "@/lib/rpc"

const mutate = useAtomSet(RpcClientTag.mutation("methodName"))
mutate({ payload, reactivityKeys?: ["users"] })
```

**Cache invalidation:**

```typescript
// Query with reactivity key
const data = useAtomValue(
  RpcClientTag.query("getUsers", void 0, { reactivityKeys: ["users"] }),
)

// Mutation that invalidates the query
const createUser = useAtomSet(RpcClientTag.mutation("createUser"))
createUser({ payload: newUser, reactivityKeys: ["users"] })
```

**References:** `apps/web/src/lib/rpc.ts`, `apps/web/src/routes/__root.tsx`

## Components

shadcn/ui (new-york), Tailwind v4, Base UI primitives, Lucide icons.

```bash
# From apps/web/
pnpm dlx shadcn@latest search <query>
pnpm dlx shadcn@latest add <component>
```

**References:** `apps/web/components.json`

## Typography

Use semantic text sizes:

```typescript
<h1 className="text-h1">Heading</h1>
<p className="text-body">Body text</p>
<span className="text-small">Small text</span>
```

Available: `text-h1` through `text-h4`, `text-lead`, `text-large`, `text-body`, `text-small`

**References:** `apps/web/src/index.css`

## Forms

TanStack Form with Standard Schema validation.

**Effect Schema (recommended):**

```typescript
import { Schema } from "effect"

const formSchema = Schema.standardSchemaV1(
  Schema.Struct({
    email: Schema.String.pipe(
      Schema.minLength(1, { message: () => "Required" }),
      Schema.pattern(/^.+@.+$/, { message: () => "Invalid email" }),
    ),
  }),
)

type FormData = Schema.Schema.Type<typeof formSchema>

const form = useForm({
  defaultValues: { email: "" } as FormData,
  validators: { onSubmit: formSchema },
  onSubmit: async ({ value }) => {
    console.log(value)
  },
})
```

**Patterns:**

- `Schema.standardSchemaV1()` - Wraps Effect Schema for TanStack Form
- `Schema.String.pipe()` - Chain validations
- `filter()` - Return `true` or string error message
- `message: () => "..."` - Error message function
- `Schema.Schema.Type<typeof schema>` - Infer TypeScript type

**References:**

- Effect Schema: `apps/web/src/routes/submit.tsx`
- TanStack Form docs: https://tanstack.com/form/latest

## Authentication

Better Auth via `better-auth/react`.

**Check session:**

```typescript
import { auth } from "@/lib/auth"

const { data: session, isPending, error, refetch } = auth.useSession()
if (session) return <div>Welcome {session.user.name}</div>
```

**Sign in/out:**

```typescript
// Social auth
const { error } = await auth.signIn.social({
  provider: "github",
  callbackURL: window.location.href,
})

// Sign out
await auth.signOut()
```

**Error handling:** All methods return `{ data, error }` - always check for errors.

**References:**

- Client setup: `apps/web/src/lib/auth.ts`
- Usage example: `apps/web/src/routes/index.tsx`

## Common Patterns

**Button Links (not nested):**

```typescript
import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"

// Correct
<Link to="/submit" className={buttonVariants({ variant: "outline" })}>
  Submit
</Link>
```

**Dropdown Menu (Base UI):**

- No nested buttons: `DropdownMenuTrigger` renders as `<button>`, don't wrap with `<Button>`
- Label requires Group: `DropdownMenuLabel` must be wrapped in `DropdownMenuGroup`

**Layout spacing:**

- **Never use margin** (`m-*`, `mx-*`, `my-*`, `mt-*`, `space-x-*`, `space-y-*`)
- **Use gaps instead**: `flex flex-col gap-4` or `grid gap-4`

**Form submission:**

```typescript
// Always use void for linting
<form onSubmit={void form.handleSubmit()}>
```

**Reactive form state:**

```typescript
// Use Subscribe for reactive UI
<form.Subscribe
  selector={(state) => state.isSubmitting}
  children={(isSubmitting) => (
    <Button disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </Button>
  )}
/>
```

**References:** `apps/web/src/routes/index.tsx`
