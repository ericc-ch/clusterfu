Vite + React + TanStack Router

## Components

shadcn/ui with new-york style, Tailwind v4, Lucide icons. Run from apps/web/.
Uses Base UI (@base-ui/react) instead of Radix UI as the underlying primitive library.

- Search: pnpm dlx shadcn@latest search <query>
- Add: pnpm dlx shadcn@latest add <component>
- List all: pnpm dlx shadcn@latest view @shadcn

References:

- apps/web/components.json

## Typography

Prioritize using semantic text sizes: text-h1, text-h2, text-h3, text-h4, text-lead, text-large, text-body, text-small

References:

- apps/web/src/index.css

## Forms

TanStack Form with Zod validation and shadcn/ui Field components.

- `validators.onSubmit` - Zod schema for field validation
- `onSubmit` handler + `useState` - Server/auth errors (separate from validation)
- `validators.onSubmitAsync` - Async validation only, not submission logic
- `form.Subscribe` - Use for reactive UI (e.g., submit button state)
- `form.state` - Snapshot, not reactive on its own

References:

- apps/web/src/routes/login.tsx
