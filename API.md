# API

Base URL: `/api/v1` (browser: same origin as the web app via the Next.js proxy; server-to-server:
`API_URL/api/v1`). Phase-1 endpoints are documented in full. Upcoming endpoints are listed in
[ARCHITECTURE.md › E](ARCHITECTURE.md#e-api-endpoint-design).

## Conventions

| Topic      | Rule                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Versioning | URI prefix `/api/v1`. Breaking changes → `/api/v2`.                                                                                              |
| Resources  | Plural nouns; actions on a resource are sub-paths: `POST /campaigns/:id/publish`.                                                                |
| IDs        | Opaque strings (UUIDv7). Public pages use slugs. Clients must not parse IDs.                                                                     |
| Auth       | HTTP-only cookies `nk_at` / `nk_rt` (browser), or `Authorization: Bearer <access token>`. Every endpoint requires auth unless marked **public**. |
| Body       | JSON, max 100 kB. `Content-Type: application/json`.                                                                                              |
| Validation | Request schemas live in `@nokkam/shared-types` (zod) and are shared with the web client.                                                         |
| Pagination | Keyset: `?limit=` (1–100) and `?cursor=` (opaque, from `meta.nextCursor`; `null` = last page).                                                   |
| Dates      | ISO-8601 UTC strings. Money (later): integer minor units + ISO currency.                                                                         |
| Tracing    | Send `X-Request-Id` to correlate. Every response echoes `X-Request-Id`.                                                                          |
| CSRF       | State-changing requests carrying an `Origin` header must come from an allowed origin (`CORS_ORIGINS`).                                           |

### Response envelope

```jsonc
// success
{ "data": { ... }, "meta": { "nextCursor": "..." } }   // meta only when relevant

// error
{
  "error": {
    "code": "VALIDATION_FAILED",            // stable, machine-readable: branch on this
    "message": "Request validation failed", // human-readable, may change
    "details": [{ "path": "email", "message": "Enter a valid email address" }],
    "requestId": "7f9b3f27-…"
  }
}
```

`204 No Content` responses have no body.

### Status codes & error codes

| HTTP | `code`                            | When                                                                                                             |
| ---- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 401  | `UNAUTHENTICATED`                 | Missing/invalid credentials or session                                                                           |
| 401  | `TOKEN_EXPIRED`                   | Access token expired (call `/auth/refresh`)                                                                      |
| 401  | `INVALID_CREDENTIALS`             | Wrong email or password (same for unknown email)                                                                 |
| 401  | `SESSION_REVOKED`                 | Refresh-token family revoked (logout elsewhere, reuse detected, suspension)                                      |
| 403  | `FORBIDDEN`                       | Authenticated but not allowed; also foreign `Origin`                                                             |
| 403  | `ACCOUNT_SUSPENDED`               | Correct password, suspended account                                                                              |
| 404  | `NOT_FOUND`                       | Resource missing **or not visible to you** (no existence leaks)                                                  |
| 409  | `CONFLICT`                        | Concurrent modification. Reload and retry                                                                        |
| 409  | `EMAIL_ALREADY_REGISTERED`        |                                                                                                                  |
| 422  | `VALIDATION_FAILED`               | Body/query failed schema validation (`details` per field)                                                        |
| 422  | `RULE_VIOLATION` / specific codes | Business rule rejected the action (e.g. `INVALID_OR_EXPIRED_TOKEN`; later `CAMPAIGN_FULL`, `ILLEGAL_TRANSITION`) |
| 429  | `RATE_LIMITED`                    | Too many requests                                                                                                |
| 500  | `INTERNAL_ERROR`                  | Unexpected. Quote `requestId` when reporting                                                                     |

---

## Health

### `GET /health` · public

`200 { "data": { "status": "ok", "database": "up" } }` · `503` if MongoDB is unreachable.

---

## Auth

All auth responses that create a session set `nk_at` (access, ~15 min) and `nk_rt` (refresh, 30 days) cookies.
Tokens are never returned in the body.

**`AuthSessionDto`**

```json
{
  "user": {
    "id": "01a1109e-b036-7ba1-b216-8110b9e61131",
    "email": "asha@example.com",
    "displayName": "Asha",
    "roles": ["TESTER"],
    "status": "ACTIVE",
    "emailVerified": false,
    "createdAt": "2026-10-06T09:49:57.702Z"
  },
  "accessTokenExpiresAt": "2026-10-06T10:04:57.000Z"
}
```

### `POST /auth/register` · public · 10/min/IP

```json
{
  "email": "asha@example.com",
  "password": "at-least-10-chars",
  "displayName": "Asha",
  "accountType": "TESTER"
}
```

`accountType`: `TESTER` | `BUSINESS_OWNER` (business owners also get `TESTER`). `ADMIN` is never accepted.
→ `201 AuthSessionDto` + cookies; sends a verification email. Errors: `422 VALIDATION_FAILED`,
`409 EMAIL_ALREADY_REGISTERED`.

### `POST /auth/login` · public · 10/min/IP

`{ "email", "password" }` → `200 AuthSessionDto` + cookies. Errors: `401 INVALID_CREDENTIALS`, `403 ACCOUNT_SUSPENDED`.

### `POST /auth/refresh` · public (uses `nk_rt` cookie) · 30/min/IP

Rotates the refresh token → `200 AuthSessionDto` + new cookies. On failure the cookies are cleared:
`401 UNAUTHENTICATED` (missing/unknown/expired) or `401 SESSION_REVOKED` (logged out or reuse detected).

### `POST /auth/logout` · public (uses `nk_rt` cookie)

Revokes the session family, clears cookies → `204`. Idempotent.

### `POST /auth/verify-email` · public · 10/min/IP

`{ "token": "<from email link>" }` → `200 CurrentUserDto` with `emailVerified: true`.
Single use. Errors: `422 INVALID_OR_EXPIRED_TOKEN`.

### `POST /auth/verify-email/resend` · authenticated · 3/min/IP

Invalidates outstanding links and emails a new one → `204` (no-op if already verified).

---

## Users

### `GET /users/me` · authenticated

→ `200 CurrentUserDto` (same shape as `AuthSessionDto.user`).

---

## Admin · role `ADMIN`

### `GET /admin/users?limit=25&cursor=…`

Newest first. → `200 { data: AdminUserSummaryDto[], meta: { nextCursor } }`. Never includes credentials.
Non-admins get `403 FORBIDDEN`.

---

## Example (curl)

```bash
B=http://localhost:4000/api/v1
curl -c jar -H 'content-type: application/json' -X POST $B/auth/register \
  -d '{"email":"asha@example.com","password":"supersecret1","displayName":"Asha","accountType":"TESTER"}'
curl -b jar $B/users/me
curl -b jar -c jar -X POST $B/auth/refresh
curl -b jar -c jar -X POST $B/auth/logout
```
