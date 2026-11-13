# noteapp

Notes API interview project. Repository: [Showrav88/noteapp](https://github.com/Showrav88/noteapp).

Monorepo layout:

- `api/` — Express 5 + MongoDB (Mongoose)
- `web/` — Next.js frontend (added in a later build step)

## API (step 1 — skeleton)

### Setup

1. Copy `api/.env.example` to `api/.env`.
2. Set `MONGODB_URI` (Atlas or local MongoDB).
3. Set `JWT_SECRET` to any long random string (used in later steps).

### Run

```bash
cd api
npm install
npm start
```

### Verify

- `GET http://localhost:3000/health` → `{ "status": "ok", "database": "connected" }`
- Open `http://localhost:3000/docs` for Swagger UI

## Step 2 — models and indexes

Schemas live in `api/src/models/`. Declared indexes only via `schema.index(...)` (no `unique: true` on the email field).

| Collection | Indexes in Atlas (including default `_id_`) |
| ---------- | --------------------------------------------- |
| users | `_id_`, `email_1` (unique), `interests_1` |
| notes | `_id_`, `owner_1__id_-1` |
| posts | `_id_`, `author_1__id_-1` |

**Verify:** run `npm start` once, then Atlas → your cluster → **Database** → each collection → **Indexes**.

## Build plan (study guide)

| Step | What | How you know it works |
| ---- | ---- | --------------------- |
| 1 | API skeleton, `/health`, Swagger | Done |
| 2 | User, Note, Post models + indexes | Atlas index counts above |
| 3 | Register, login, JWT middleware, seed admin | `npm run seed` |
| 3–9 | Full REST API + aggregations + OpenAPI | Done in `api/` |
| 4 | Notes CRUD + pagination | User B cannot read user A’s note (404) |
| 5 | Admin users + `GET /notes/all` | Paginated; admin cannot delete self |
| 6 | Posts create + Scenario 2 aggregation | One `aggregate()` call |
| 7 | Scenario 1 (`GET /users/by-interest`) | One `aggregate()`; correct `hasNextPage` |
| 8 | `scripts/explain.js` | No COLLSCAN on list/read queries |
| 9 | OpenAPI for every endpoint | Try from `/docs` |
| 10 | Next.js frontend (`web/`) | Done — see below |
| 11 | Deploy API + web on Render | Public URLs work |

## Web (step 10)

Design follows [Care Guide Web Development](https://careguidebd.com/service/web-development/) colors: navy `#211E3B`, cyan `#43BAFF`, accent orange `#FF3C00`, muted `#F8F8F8`.

| Page | API |
|------|-----|
| `/login`, `/register` | `POST /auth/*`, `GET /interests/options` |
| `/notes` | Notes CRUD + pagination |
| `/posts` | `GET/POST /posts` → link to `/posts/user/:id` |
| `/posts/user/:id` | Scenario 2 — `GET /users/:id/posts` |
| `/interests` | Scenario 1 — `GET /users/by-interest` |
| `/admin` | Users + `GET /notes/all` (admin only) |

```bash
cd web
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev
```

Open `http://localhost:3001`. Set API `CORS_ORIGIN=http://localhost:3001`.

| 12 | README with index explanations | Reviewer can run and understand indexes |

## Interests (catalog + Scenario 1)

- **Catalog:** `api/src/config/interestOptions.js` — 10 fixed tags (`chess`, `reading`, `music`, …). No free-text interests.
- **API:** `GET /interests/options` (public) returns `{ items: [{ value, label }] }`.
- **Validation:** `parseInterests()` in `api/src/utils/interests.js` runs on `POST /auth/register`, admin `POST /users`, and admin `PATCH /users/:id`.
- **Scenario 1 (unchanged):** `GET /users/by-interest` — one `User.aggregate()` on the **users** collection (`$match` → `$unwind` → `$group` → `$sort` → paginate). The web `/interests` page uses this endpoint.
- **Index `users.interests_1`:** multikey index; supports the first `$match` on users who have string interests. Run `cd api && node scripts/explain.js` and check **Scenario 1 match on interests** uses the index (not `COLLSCAN`).

### Faster reads (theory — not implemented)

For very large user counts, a denormalized `interests` collection with `userCount` (updated on register/update/delete) lets reads `$sort` / `$limit` on precomputed counts and `$lookup` users only for the current page. This repo keeps the **PDF-required** users pipeline for grading; hybrid sync can be added later as an optional endpoint.

Register and admin **Add user** use chip multi-select fed by `/interests/options` (no typing).
