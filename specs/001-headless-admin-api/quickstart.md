# Quickstart: Portfolio CMS & Admin Dashboard

**Feature directory**: `specs/001-headless-admin-api/`  
**Date**: 2026-05-08

## Prerequisites

- Node.js **20+** (LTS recommended)
- **MongoDB** reachable locally or **MongoDB Atlas** URI
- Git on `branch` **001-headless-admin-api** (or merge after review)

## Repository layout (target)

After implementation, expect:

- `backend/` — NestJS API
- `admin/` — Vite + React admin SPA

(Exact folder names may match `plan.md` → Project Structure.)

## Backend

1. `cd backend`
2. Copy `.env.example` → `.env` (create during implementation) with at least:
   - `MONGODB_URI`
   - `JWT_SECRET` (strong random)
   - `JWT_EXPIRES_IN` (e.g. `15m` or `1d` per security choice)
   - `CORS_ORIGINS` — comma-separated origins (Lovable preview/production + admin origin)
3. `npm install` then `npm run start:dev`
4. Open Swagger UI path documented in app bootstrap (e.g. `/api/docs`).

## Admin dashboard

1. `cd admin`
2. `.env` / `.env.local`: `VITE_API_BASE_URL` pointing to the NestJS base (e.g.
   `http://localhost:3000/api`)
3. `npm install` then `npm run dev`
4. Log in with the admin email and password from `backend/.env` (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`); defaults in `backend/.env.example` are for local development only.

## Verify headless flow

1. Create or update a project via admin UI (or Swagger with Bearer token).
2. Call **public** `GET /api/projects` from curl or the Lovable site without auth.
3. Confirm new data and populated technologies appear immediately.

## Useful references in this feature

| Artifact | Purpose |
|----------|---------|
| [spec.md](./spec.md) | Requirements & user stories |
| [plan.md](./plan.md) | Technical plan & constitution gates |
| [data-model.md](./data-model.md) | Fields & delete rules |
| [contracts/openapi.yaml](./contracts/openapi.yaml) | HTTP contract |
| [research.md](./research.md) | Resolved design decisions |
