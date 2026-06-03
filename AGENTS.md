# AGENTS.md — waitly

## Monorepo layout

Two independent Cloudflare Workers, each with its own `package.json`, `wrangler.jsonc`, `tsconfig`, and `node_modules`. No workspaces, no shared lockfile.

- `backend/` — Hono API Worker (`waitly-api`, port **8787**)
- `frontend/` — Vite + React 19 SPA Worker (`waitly-frontend`, port **5173**)

```
.
├── backend/   # Hono Worker
├── frontend/  # Vite + React Worker
└── package.json  # orchestration scripts only
```

## Commands

Require Node 22+.

| From root | Description |
|---|---|
| `npm run dev` | backend + frontend in parallel |
| `npm run dev:backend` | backend only (`wrangler dev`) |
| `npm run dev:frontend` | frontend only (`vite dev`) |
| `npm run typecheck` | both apps in parallel |
| `npm run build` | backend `cf-typegen` + frontend `vite build` |
| `npm run format` | Prettier on both apps |
| `npm run cf-typegen` | regenerate `worker-configuration.d.ts` in both apps |
| `npm run install:all` | install deps in root + both apps |

**Backend** (`cd backend`)
- `npm run dev` → `wrangler dev` → http://localhost:8787
- `npm run typecheck` → `tsc --noEmit`
- `npm run deploy` → `wrangler deploy`
- `npm run cf-typegen` → regenerate `worker-configuration.d.ts`

**Frontend** (`cd frontend`)
- `npm run dev` → `vite dev` → http://localhost:5173
- `npm run build` → `tsc -b && vite build`
- `npm run lint` → `eslint .`
- `npm run typecheck` → `tsc -b --noEmit`
- `npm run deploy` → `vite build && wrangler deploy`

## Backend architecture

**Entry:** `src/index.ts` — Hono app, mounts CORS, `GET /health`, `POST /waitlist`. Returns JSON.

**Routes:**
- `GET /health` — liveness probe.
- `POST /waitlist` — body `{ email: string }`. Validates email, calls `waitlistStore.addEmail()`, returns `{ message, entry }`. `201` on success, `400` on validation failure.

**Persistence abstraction** (`src/services/waitlist.ts`):
- `WaitlistStore` interface with `addEmail(email) → Promise<WaitlistEntry>`.
- Default impl: `InMemoryWaitlistStore` (in-process `Set<string>`).
- Designed to be swapped for a `D1WaitlistStore` later — see `README.md` for the recipe.

**Validation** (`src/services/validation.ts`):
- `isValidEmail` — regex check, length cap 254.

**CORS** (`src/middleware/cors.ts`):
- Reads `CORS_ORIGIN` from env (default `http://localhost:5173`).
- Returns `Access-Control-Allow-*` headers and short-circuits `OPTIONS` with `204`.

**Env:** `CORS_ORIGIN` is declared in `wrangler.jsonc` → `vars`. Types in `src/types/env.ts` — the `Env` interface is hand-maintained for now.

**Wrangler:** name `waitly-api`, dev port `8787`, `compatibility_date` `2026-05-23`, observability enabled.

## Frontend architecture

**Stack:** Vite 7 + React 19 + TypeScript. ESLint flat config + Prettier.

**Entry HTML:** `index.html` → `src/main.tsx` → `<App />`.

**App layout** (`src/App.tsx`):
- `WaitlistHeader` — brand chip + course pill.
- `WaitlistHero` — eyebrow, gradient title, subtitle, bullet list.
- `WaitlistForm` — email input + submit button. Manages `idle | loading | success | error` state machine, client-side email validation, calls the API.
- `WaitlistFooter` — backend health probe + copyright.

**API client** (`src/lib/api.ts`):
- `joinWaitlist(email)` → `POST {API_BASE}/waitlist` with `Content-Type: application/json`.
- Throws `Error` with the server's `error` message on non-2xx.

**API base URL:** `import.meta.env.VITE_API_URL ?? '/api'`. In dev, Vite's proxy (`vite.config.ts`) rewrites `/api/*` → `http://localhost:8787/*`.

**Vite config** (`vite.config.ts`):
- `@vitejs/plugin-react`.
- Server port `5173`, proxy `/api` → `API_TARGET` (`process.env.VITE_API_URL ?? 'http://localhost:8787'`), strips the `/api` prefix.

**Wrangler:** name `waitly-frontend`, dev port `5173`, `not_found_handling: single-page-application`, `compatibility_date` `2026-05-23`. No bindings.

## TypeScript

- `frontend/tsconfig.json` — references `tsconfig.app.json` (src/) and `tsconfig.node.json` (vite config).
- `backend/tsconfig.json` — single config for `src/**/*` with `@cloudflare/workers-types/2023-07-01`.

## Key gotchas

| # | Gotcha |
|---|--------|
| 1 | Root has no app code — only orchestration scripts. Don't import across the boundary. |
| 2 | Each app installs its own deps. `npm run install:all` is the only supported way to bootstrap. |
| 3 | CORS origin defaults to `http://localhost:5173` in `wrangler.jsonc` `vars`. For prod, set it via `wrangler secret put CORS_ORIGIN` or override in deploy. |
| 4 | `VITE_API_URL` is read at build time in the frontend. Local dev gets the proxy for free; set it explicitly in CI/CD for production. |
| 5 | The persistence store is in-memory — restarting `wrangler dev` clears all entries. Replace with D1 before going to staging. |
| 6 | `import.meta.env.VITE_API_URL` requires `tsconfig.app.json` to include `"types": ["vite/client"]` (already set). |
| 7 | `wrangler deploy` for the frontend runs `vite build` first — make sure the build output is fresh. |
