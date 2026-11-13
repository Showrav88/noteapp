# noteapp

Notes API interview project. Repository: [Showrav88/noteapp](https://github.com/Showrav88/noteapp).

Monorepo layout:

- `api/` — Express 5 + MongoDB (Mongoose)
- `web/` — Next.js frontend

## API (step 1 — skeleton)

### Setup

1. Copy `api/.env.example` to `api/.env`.
2. Set `MONGODB_URI` (Atlas or local MongoDB).
3. Set `JWT_SECRET` to any long random string.
4. Optional (local admin): `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — then `npm run seed`.

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
| 8 | `npm run explain` in `api/` | No COLLSCAN on listed queries |
| 9 | OpenAPI for every endpoint | Try from `/docs` |
| 10 | Next.js frontend (`web/`) | Done — see below |
| 11 | Deploy API + web on Render | Public URLs below |
| 12 | README index explanations | Section below |

## Deployment (step 11)

**API (Render):** https://noteapp-a4z2.onrender.com

- Health: `GET /health`
- Docs: `/docs`

**API environment variables (Render):**

| Variable | Purpose |
| -------- | ------- |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Sign login tokens |
| `CORS_ORIGIN` | Full URL of the web app (no trailing slash), e.g. `https://your-web.onrender.com` |

**Web (Render):** Create a second service with root directory `web`, build `npm ci && npm run build`, start `npm start`.

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_API_URL` | API base URL, e.g. `https://noteapp-a4z2.onrender.com` |

Set API `CORS_ORIGIN` to match the web service URL after both are live.

## Web (step 10)

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

### Quick demo (for reviewers)

1. Register with at least one interest → **Notes** → create a note.
2. **Post feed** → create a post → open author → their posts list.
3. **By interest** → grouped users per tag.
4. `npm run seed` + login as admin → **Admin** → list users / all notes (admin cannot delete own account).

## Index explanations (step 12)

Each declared index maps to a real query in this project. No extra indexes beyond the table in step 2.

| Index | Query / endpoint | Why |
| ----- | ---------------- | --- |
| `users.email_1` (unique) | `POST /auth/login` — `User.findOne({ email })` | Point lookup for login; unique prevents duplicate accounts |
| `users.interests_1` (multikey) | Scenario 1 — first `$match` on `interests` in `usersByInterest` | Multikey index on array field; supports matching users with interests before `$unwind` |
| `notes.owner_1__id_-1` | `GET /notes` — `find({ owner }).sort({ _id: -1 }).limit(...)` | Owner filter + newest-first pagination in one compound index |
| `posts.author_1__id_-1` | Scenario 2 — `$lookup` on `posts` where `author` equals user `_id`, sub-pipeline sorts by `_id` descending | Matches posts by author efficiently for lookup + sort |

**Scenario 1** (`GET /users/by-interest`): exactly **one** `User.aggregate()` — `$match` → `$unwind` → `$group` → `$sort` → `$skip` / `$limit`. Implementation: `api/src/services/users.service.js` (`usersByInterest`).

**Scenario 2** (`GET /users/:id/posts`): exactly **one** `User.aggregate()` with `$lookup` into `posts`. Same file (`getUserPosts`).

### Verify with explain

```bash
cd api
npm run explain
```

Check each printed plan for **IXSCAN** (or equivalent indexed access), not **COLLSCAN**, on:

- Login by email  
- Scenario 1 match on interests  
- My notes list  
- Scenario 2 lookup posts  

Requires at least one user in the database (register or seed first).

## Interests (catalog + Scenario 1)

- **Catalog:** `api/src/config/interestOptions.js` — 10 fixed tags (`chess`, `reading`, `music`, …). No free-text interests.
- **API:** `GET /interests/options` (public) returns `{ items: [{ value, label }] }`.
- **Validation:** `parseInterests()` in `api/src/utils/interests.js` on register and admin user create/update (at least one interest required).
- **UI:** Product-facing copy on `web/`; aggregation details for graders are in this README and OpenAPI.
- **Scenario 1 (unchanged):** `GET /users/by-interest` — one `User.aggregate()` on **users** as above.

### Faster reads (theory — not implemented)

At scale, a denormalized `interests` collection with `userCount` (sync on register/update/delete) could speed reads; this repo keeps the PDF-required users pipeline for grading.

Register and admin **Add user** use chip multi-select from `/interests/options`.
