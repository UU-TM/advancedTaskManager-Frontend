# Kanban Frontend — Alucard × Dracula

A scalable Next.js App Router foundation for the Kanban product. Ships with:

- **Two official palettes** — Alucard (light) and Dracula (dark) — wired to CSS variables and switched live via `next-themes`.
- **Typed API client** — a fetch wrapper that unwraps the backend `{ message, status, data }` envelope, surfaces typed `ApiError`s, and auto-refreshes on 401.
- **shadcn/ui primitives** — restyled with our tokens. Button, Input, Label, Card, Badge, Avatar, Dialog, Progress, Skeleton, plus alerts, tabs, switches, and more.
- **Auth infrastructure** — access token in memory, refresh token in an `httpOnly` cookie managed by Next.js route handlers, `middleware.ts` protecting `/boards`, `/workspace`, etc.
- **TanStack Query** for server state, **react-hook-form + Zod** for forms, **Tailwind CSS 4** for styling.

> This repo is the bootstrap. The auth pages, boards dashboard, and kanban board UI live in their own feature branches (`feat/auth-pages`, `feat/boards-dashboard`, …).

---

## Quick start

```bash
# 1. Install deps
bun install            # or: npm install / pnpm install

# 2. Configure env
cp .env.example .env
#   → set NEXT_PUBLIC_API_URL to your backend URL

# 3. Run
bun run dev            # opens http://localhost:3000
```

Open the **[component showcase](http://localhost:3000/dev/components)** to verify both themes.

---

## Project layout

```
src/
  app/                    # routes only (thin)
    page.tsx              # landing
    login/                # auth page
    boards/               # protected — boards list
    workspace/            # protected — workspace list
    dev/components/       # component showcase (both themes)
    api/auth/             # route handlers (refresh / logout / login proxy)
    providers.tsx         # ThemeProvider + QueryClient + AuthProvider
    layout.tsx            # root layout (Server Component)
    globals.css           # theme tokens (Alucard + Dracula)
  components/
    ui/                   # shadcn/ui primitives (restyled)
    layout/               # AppShell, Sidebar, Header, ThemeToggle
    features/             # auth, boards, kanban (barrels)
  lib/
    api/                  # client.ts, errors.ts, auth.ts, workspaces.ts, boards.ts, cards.ts
    auth/                 # context.tsx, storage.ts, config.ts
    validators/           # Zod schemas (auth, workspace, board, card)
    utils.ts              # cn() helper
  hooks/
    use-auth.ts           # re-export of useAuth()
    use-mobile.ts
    use-toast.ts
  types/
    api.ts                # envelope, error, pagination
    domain.ts             # User, Workspace, Board, Card, ...
  middleware.ts           # edge auth guard
```

---

## Theming

Tokens live in [`src/app/globals.css`](src/app/globals.css) under two class selectors:

```css
:root, .alucard { /* light palette */ }
.dracula         { /* dark  palette */ }
```

| Token                | Alucard (light) | Dracula (dark) |
| -------------------- | ---------------- | -------------- |
| `--background`       | `#FFFBEB`        | `#282A36`      |
| `--foreground`       | `#1F1F1F`        | `#F8F8F2`      |
| `--primary`          | `#CB3A2A`        | `#BD93F9`      |
| `--secondary`        | `#644AC9`        | `#FF79C6`      |
| `--success`          | `#14710A`        | `#50FA7B`      |
| `--info`             | `#036A96`        | `#8BE9FD`      |
| `--muted` / `--border` | `#DEDCCF`      | `#44475A`      |
| `--card`             | `#EFEDDC`        | `#44475A`      |

`next-themes` is configured with `attribute="class"` and `themes={["alucard", "dracula"]}`. Use the `ThemeToggle` component in the header to switch — primitives update without a page reload. Use Tailwind's `dark:` variant for Dracula-only overrides; it's mapped to `.dracula` via `@custom-variant` in `globals.css`.

**Never hardcode hex values inside components** — always use the CSS variables (e.g. `bg-primary`, `text-foreground`, `bg-success`).

---

## API layer

### Client

[`src/lib/api/client.ts`](src/lib/api/client.ts) exports `apiFetch<T>(path, options)` which:

1. Prepends `NEXT_PUBLIC_API_URL` (default `http://localhost:3000`).
2. Injects `Authorization: Bearer <accessToken>` from in-memory storage (unless `skipAuth`).
3. Parses the backend envelope `{ message, status, data }` and returns `data` typed as `T`.
4. On `401` (and not a public path), triggers a single refresh attempt and retries the original request.
5. Throws an `ApiError` for any non-2xx response — `err.status`, `err.code`, `err.isUnauthorized`, `err.isValidation` are all typed.

```ts
import { apiFetch, ApiError } from "@/lib/api";

try {
  const board = await apiFetch<Board>(`/boards/${id}`);
} catch (err) {
  if (err instanceof ApiError && err.isUnauthorized) {
    // already handled by the client (refresh / redirect)
  } else if (err instanceof ApiError && err.isValidation) {
    // surface err.details to the form
  }
}
```

### Modules

Each domain lives in its own file with full TypeScript signatures:

| Module       | File                                | Notes |
| ------------ | ----------------------------------- | ----- |
| `authApi`    | `lib/api/auth.ts`                   | login / register / refresh / logout / me |
| `workspacesApi` | `lib/api/workspaces.ts`          | `list` waits on `GET /workspaces` |
| `boardsApi`  | `lib/api/boards.ts`                 | `listByWorkspace` and `get` wait on backend routes |
| `cardsApi`   | `lib/api/cards.ts`                  | CRUD + move + assign/unassign |

### Server state

TanStack Query is pre-configured in [`src/app/providers.tsx`](src/app/providers.tsx):

- `staleTime: 30s`
- `refetchOnWindowFocus: false`
- 4xx errors are not retried automatically

### Zod validators

Schemas in [`src/lib/validators/`](src/lib/validators) mirror the backend DTOs. Use them with `react-hook-form` via `zodResolver`:

```ts
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

If the backend publishes Swagger at `/api`, generate types from there and replace the hand-written schemas in one pass.

---

## Auth

### Token strategy

| Token          | Storage                                  | Lifetime |
| -------------- | ---------------------------------------- | -------- |
| Access token   | In-memory only (`authStorage.accessToken`) | Short (e.g. 15 min) |
| Refresh token  | `httpOnly`, `Secure`, `SameSite=Lax` cookie (`kanban.refresh-token`) | 30 days |

The refresh cookie is **never readable from client-side JS**, which mitigates XSS-driven token theft. The access token never leaves memory, so it dies with the tab.

### Route handlers

Three route handlers under `src/app/api/auth/` proxy auth operations so the refresh cookie rides along automatically:

| Route                    | Purpose |
| ------------------------ | ------- |
| `POST /api/auth/login`   | Forward credentials, plant the refresh cookie, return access token |
| `POST /api/auth/refresh` | Exchange the refresh cookie for a new access token; rotate the cookie |
| `POST /api/auth/logout`  | Invalidate the refresh token server-side, clear the cookie |

### Edge middleware

[`middleware.ts`](middleware.ts) reads the refresh cookie. If a protected route (`/boards`, `/workspace`, `/settings`, `/profile`) is hit without one, the user is redirected to `/login?next=<original-path>`.

> We can't validate the access token at the edge (it's only in memory on the client). The cookie is the canonical "has a session" signal. If the access token has expired, the `AuthProvider` silently refreshes on the client.

### Hooks

- `useAuth()` — `{ user, isAuthenticated, isLoading, login, register, logout, refresh }`.
- The `AuthProvider` runs an initial silent refresh on mount to restore the session across reloads.

---

## Conventions

| Topic              | Convention |
| ------------------ | ---------- |
| Components         | Server Components by default; `"use client"` only when needed |
| Data fetching      | TanStack Query in client components; Server Components for initial load where it fits |
| Forms              | `react-hook-form` + `zod` |
| Styling            | Tailwind + CSS variables; **no hardcoded hex** in components |
| Naming             | `kebab-case` files, `PascalCase` components |
| API docs           | Backend Swagger: `http://localhost:3000/api` |
| Git                | Feature branches: `feat/auth-pages`, `feat/boards-dashboard`, … |

---

## Backend coordination checklist

Before integration is fully done, align with the backend team on:

1. `GET /workspaces` — list user workspaces
2. `GET /workspaces/:id/boards` — list boards in a workspace
3. `GET /boards/:id` — board with columns and cards (nested)
4. CORS: set `CORS_ORIGIN=http://localhost:3001` (or your Next.js port) in backend `.env`

---

## Scripts

| Command            | Description |
| ------------------ | ----------- |
| `bun run dev`      | Start the dev server on port 3000 |
| `bun run lint`     | ESLint + Next.js rules |
| `bun run build`    | Production build |
| `bun run db:push`  | Push Prisma schema to the DB (not used by the frontend yet) |
