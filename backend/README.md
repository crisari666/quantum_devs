# Portfolio CMS API

NestJS + MongoDB headless API for the Quantum Devs portfolio admin and public catalog.

## Setup

1. Copy `.env.example` to `.env` and configure `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, and optional `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` for a first admin user.
2. `npm install`
3. `npm run start:dev`

Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Scripts

- `npm run start:dev` — watch mode
- `npm run build` — compile
- `npm run test:e2e` — integration tests (uses in-memory MongoDB)
