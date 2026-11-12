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

## Indexes (added in step 2)

| Collection | Index |
| ---------- | ----- |
| users | `{ email: 1 }` unique |
| users | `{ interests: 1 }` |
| notes | `{ owner: 1, _id: -1 }` |
| posts | `{ author: 1, _id: -1 }` |
