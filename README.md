# Waitly

Waitlist for the **Cloudflare Workers** course on Platzi. Monorepo with two independent Cloudflare Workers:

- **`backend/`** — Hono API Worker (`waitly-api`) — `POST /waitlist`, `GET /health`, CORS, abstracted persistence (in-memory mock, ready to swap for D1).
- **`frontend/`** — Vite + React 19 SPA Worker (`waitly-frontend`) — waitlist signup page with idle / loading / success / error states.

## Requirements

- Node.js **22+**
- npm **10+**

## Install

```bash
npm run install:all
```

This installs root tooling plus dependencies in both `backend/` and `frontend/`. Each app has its own `package.json` and `node_modules`.

## Development

Run both apps in parallel:

```bash
npm run dev
```

- Frontend → http://localhost:5173
- Backend → http://localhost:8787

The Vite dev server proxies `/api/*` to the backend (see `frontend/vite.config.ts`), so the frontend can simply call `fetch('/api/waitlist')`.

Run them individually:

```bash
npm run dev:backend   # wrangler dev
npm run dev:frontend  # vite dev
```

## Type checking & build

```bash
npm run typecheck
npm run build
```

## Project layout

```
.
├── backend/            # Hono Worker
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   └── cors.ts
│   │   ├── services/
│   │   │   ├── waitlist.ts        # persistence abstraction (mock impl)
│   │   │   └── validation.ts
│   │   └── types/
│   │       └── env.ts
│   ├── wrangler.jsonc
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/           # Vite + React SPA Worker
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── components/
│   │   │   ├── WaitlistForm.tsx
│   │   │   ├── WaitlistHeader.tsx
│   │   │   ├── WaitlistHero.tsx
│   │   │   └── WaitlistFooter.tsx
│   │   └── lib/
│   │       └── api.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── wrangler.jsonc
│   └── package.json
│
└── package.json        # orchestration scripts
```

## Backend

`POST /waitlist`

```json
{ "email": "you@example.com" }
```

Responses:

- `201` → `{ "message": "You're on the list", "entry": { "email", "createdAt" } }`
- `400` → `{ "error": "A valid email is required" }`
- `400` → `{ "error": "Invalid JSON body" }`

`GET /health` → `{ "status": "ok", "service": "waitly-api", "timestamp": "..." }`

CORS is configured via the `CORS_ORIGIN` env var (default `http://localhost:5173`).

### Swapping the persistence layer

`backend/src/services/waitlist.ts` exposes a `WaitlistStore` interface. The default in-memory implementation can be replaced with a D1-backed store:

```ts
import type { WaitlistStore, WaitlistEntry } from "./waitlist";

export class D1WaitlistStore implements WaitlistStore {
  constructor(private db: D1Database) {}

  async addEmail(email: string): Promise<WaitlistEntry> {
    await this.db
      .prepare("INSERT OR IGNORE INTO waitlist (email) VALUES (?)")
      .bind(email)
      .run();
    return { email, createdAt: new Date().toISOString() };
  }
}
```

Then wire it up in `src/index.ts` using the `DB` binding from `wrangler.jsonc`.

## Deployment

Each app is deployed independently:

```bash
npm --prefix backend run deploy
npm --prefix frontend run deploy
```

## License

MIT
