# Nokkam

**Local business customer testing & private feedback platform.**

Businesses run private customer-experience campaigns ("Chicken Mandi: ₹250 → ₹99, 50 spots").
Local testers join solo or in groups, visit, check in, redeem the offer, and leave **honest, private feedback**
that only the business sees. Rewards never depend on whether feedback is positive.

> **Status: Phase 1 (Foundation) complete.** Auth, RBAC, logging, error handling, the database layer, Docker dev
> environment and the web shell are done. Campaigns, groups, check-in and feedback are Phases 2–7
> (see [ARCHITECTURE.md › Development phases](ARCHITECTURE.md#j-development-phases)).

| Doc                                | What's in it                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture, domain model, Mongo schema & indexes, auth design, state machines, concurrency, SEO |
| [API.md](API.md)                   | REST conventions, envelope, error codes, endpoints                                                |

---

## 1. Run it locally

### Prerequisites

- **Node.js ≥ 22.12** (`nvm use` picks it up from `.nvmrc`)
- **pnpm 11** (`corepack enable`, or `npm i -g pnpm`)
- **Docker** (for MongoDB + Mailpit)

### First-time setup

```bash
nvm use                       # Node 22
pnpm install                  # installs every workspace
cp .env.example .env          # then put real random values in the two JWT secrets:
openssl rand -base64 48       #   run twice, paste into JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
pnpm db:up                    # MongoDB (replica set, port 27018) + Mailpit (SMTP 1025, UI 8025)
```

### Start the apps

```bash
pnpm dev
```

| What                                     | URL                                                     |
| ---------------------------------------- | ------------------------------------------------------- |
| Web app                                  | http://localhost:3000                                   |
| API                                      | http://localhost:4000/api/v1 (health: `/api/v1/health`) |
| Mailpit (only if `EMAIL_TRANSPORT=smtp`) | http://localhost:8025                                   |

**Ports already in use?** Change `PORT` (API) in `.env`, and run the web app on another port:
`pnpm --filter @nokkam/web exec next dev --port 3100`. Then set `WEB_URL`/`CORS_ORIGINS` to the new web URL and
`API_URL` to the new API URL.

> `API_URL` and `WEB_URL` are read by Next.js **at build time** for the `/api` proxy, sitemap and robots.txt.
> After changing them, restart `next dev` or re-run `next build`.

### Create an admin

Admins are never self-registered. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` (≥ 12 chars) in `.env`, then:

```bash
pnpm --filter @nokkam/api seed:admin
```

### Everything in Docker (optional)

```bash
docker compose --profile app up     # mongo + mailpit + api + web, source bind-mounted
```

---

## 2. Using the app (Phase 1)

### As a tester

1. Open the home page → **Start exploring** (or **Join free**).
2. Pick **"I want to try places"**, enter name, email, password (≥ 10 chars) → **Create account**.
3. You land on **Explore** (`/dashboard/tester`). A banner asks you to confirm your email.
4. Confirm your email:
   - `EMAIL_TRANSPORT=log` (default): the API terminal prints the email; open the `.../verify-email?token=...` link.
   - `EMAIL_TRANSPORT=smtp`: open Mailpit at http://localhost:8025 and click the link.
5. Campaign discovery arrives in Phase 2, so the list is empty for now.

### As a business owner

1. **I run a business** on the home page (or `/register?as=business`).
2. You land on **My business**. Business accounts can also join campaigns as testers (both tabs show).
3. Business profile & campaign creation arrive in Phase 3.

### As an admin

1. Run the seed command above, then sign in with `ADMIN_EMAIL`.
2. The **Admin** tab lists all accounts (roles, status, verification).
3. Testers and business owners get `403 FORBIDDEN` from `/api/v1/admin/*`, and the UI hides the tab.

### Session behaviour

- Tokens live only in **HTTP-only cookies** (`nk_at` 15 min, `nk_rt` 30 days, rotated on every use).
- Expired access tokens are refreshed automatically (in the Next proxy for page loads, and in the browser API client
  for fetches). **Sign out** revokes the session server-side.

---

## 3. Commands

| Command                                        | Does                                             |
| ---------------------------------------------- | ------------------------------------------------ |
| `pnpm dev`                                     | API (watch) + web (dev) + shared-types (watch)   |
| `pnpm build`                                   | Production build of all packages                 |
| `pnpm test`                                    | Unit + integration + e2e (API)                   |
| `pnpm --filter @nokkam/api test:unit`          | Domain/use-case tests only (no DB, ~1s)          |
| `pnpm --filter @nokkam/api test:integration`   | Repositories & transactions on in-memory MongoDB |
| `pnpm --filter @nokkam/api test:e2e`           | Full HTTP flows via supertest                    |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Quality gates                                    |
| `pnpm db:up` / `pnpm db:down`                  | Start/stop MongoDB + Mailpit                     |

Integration/e2e tests start an in-memory MongoDB **replica set** (via `mongodb-memory-server`). They use
`/usr/bin/mongod` if present, otherwise download a binary on first run. Set `TEST_MONGODB_URI` to use an
existing replica set instead.

---

## 4. Environment variables

See [`.env.example`](.env.example) for the full annotated list. Key ones:

| Variable                                             | Used by   | Notes                                                                          |
| ---------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `MONGODB_URI`                                        | api       | Must point at a **replica set** (transactions). Compose provides one on 27018. |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`            | api       | ≥ 32 chars; the API refuses placeholder secrets in production.                 |
| `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_DAYS` | api       | Defaults 900 s / 30 days.                                                      |
| `CORS_ORIGINS`                                       | api       | Comma-separated allowed browser origins (also used for the CSRF Origin check). |
| `COOKIE_SECURE`                                      | api       | Must be `true` in production (HTTPS).                                          |
| `TRUST_PROXY_HOPS`                                   | api       | Number of proxies in front of the API, for real client IPs in rate limiting.   |
| `EMAIL_TRANSPORT`                                    | api       | `log` (print emails) or `smtp`.                                                |
| `WEB_URL`                                            | api + web | Public web URL: email links, canonical URLs, sitemap.                          |
| `API_URL`                                            | web       | Where the Next server reaches the API (SSR and the `/api/v1/*` proxy).         |

---

## 5. Repository layout

```
apps/
  api/             NestJS modular monolith (clean architecture per module)
  web/             Next.js 16 App Router (SEO public site + dashboards)
packages/
  shared-types/    Public API contracts: DTO types, enums, zod request schemas
  tsconfig/        Shared TS configs
  eslint-config/   Shared flat ESLint configs
docker/            Dev Dockerfile
docker-compose.yml MongoDB (replica set) + Mailpit (+ api/web with --profile app)
```

Full folder tree and rationale: [ARCHITECTURE.md › B](ARCHITECTURE.md#b-folder-structure).

## 6. Deployment (outline; hardened in Phase 7)

- API: `pnpm --filter @nokkam/api build && node apps/api/dist/main.js` behind a TLS-terminating proxy;
  `NODE_ENV=production`, `COOKIE_SECURE=true`, real secrets, `TRUST_PROXY_HOPS` set correctly.
- Web: build with production `API_URL`/`WEB_URL`, then `next start`. The browser only talks to the web origin.
- MongoDB: a replica set (Atlas or self-hosted). In production `autoIndex` is off, so build indexes as a release step.
- Running more than one API replica: move the rate-limit store to Redis (see ARCHITECTURE.md › Security).
