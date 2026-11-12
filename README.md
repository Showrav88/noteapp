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
| 3 | Register, login, JWT middleware, seed admin | 401/403 cases |
| 4 | Notes CRUD + pagination | User B cannot read user A’s note (404) |
| 5 | Admin users + `GET /notes/all` | Paginated; admin cannot delete self |
| 6 | Posts create + Scenario 2 aggregation | One `aggregate()` call |
| 7 | Scenario 1 (`GET /users/by-interest`) | One `aggregate()`; correct `hasNextPage` |
| 8 | `scripts/explain.js` | No COLLSCAN on list/read queries |
| 9 | OpenAPI for every endpoint | Try from `/docs` |
| 10 | Next.js frontend (`web/`) | Pages hit the API |
| 11 | Deploy API + web on Render | Public URLs work |
| 12 | README with index explanations | Reviewer can run and understand indexes |
