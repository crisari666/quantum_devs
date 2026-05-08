# Implementation Plan: Headless Catalog & Admin Console

**Branch**: `001-headless-admin-api` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-headless-admin-api/spec.md` plus execution
phases for NestJS + MongoDB backend, JWT auth, headless public reads, and Vite/React admin.

## Summary

Deliver a **headless CMS API** (NestJS + MongoDB) as the single source of truth for a
**separately hosted portfolio** (e.g. Lovable) and an **internal admin SPA** (Vite, React
18, TypeScript strict, Redux Toolkit, Tailwind). Public consumers use **read-only catalog**
endpoints with **CORS allowlisting**; administrators authenticate with **Passport JWT +
bcrypt** and perform full **CRUD on projects and technologies**, with **Mongoose** models,
**class-validator** DTOs, **Swagger** for every route, and **React Hook Form + Zod** on
admin forms. Integration tests prove admin changes are visible on public reads immediately.

## Technical Context

**Language/Version**: TypeScript **5.x** strict; Node.js **20 LTS**  
**Primary Dependencies**: **Backend**: NestJS, Mongoose, Passport JWT, bcrypt,
class-validator, `@nestjs/swagger`. **Admin**: Vite, React 18+, Redux Toolkit, Tailwind CSS,
React Hook Form, Zod, RTK Query (optional for data fetching; RTK slices required for auth +
cache per plan).  
**Storage**: MongoDB (**Atlas** or local) via Mongoose; reference array `Project.technologies` → `Technology`  
**Testing**: Jest; **Supertest** integration tests for API; manual/E2E checklist for
admin→public visibility (Playwright optional follow-up)  
**Target Platform**: Linux/macOS dev; container-friendly production (not mandated in v1)  
**Project Type**: Web — **split backend + admin SPA** (portfolio frontend out of repo)  
**Performance Goals**: Public project list under **3 seconds** for up to 100 projects (per
spec SC-001);
paginated admin lists; avoid unbounded Mongo queries on admin routes  
**Constraints**: Constitution — no `any`, Swagger on all HTTP endpoints, JWT on mutations,
Zod+RHF on admin writes, mobile-first accessible UI, CORS restricted to known origins  
**Scale/Scope**: Few admin users; catalog order **≤100s** of projects/technologies in v1

## Constitution Check

*GATE: Passed before Phase 0. Re-checked after Phase 1 design — still passing.*

Verify alignment with `.specify/memory/constitution.md` (Quantum Devs Portfolio Platform):

- **Stack**: React 18+ (strict TS, Redux Toolkit, Tailwind); NestJS + TS; MongoDB + Mongoose
  with typed, validated schemas — **reflected in Technical Context and structure**.
- **Architecture**: Backend layered controllers → services → data; admin UI uses atomic
  components; Nest feature modules (`auth`, `projects`, `technologies`, `users`).
- **Type safety**: No `any`; DTOs + Mongoose document types at boundaries.
- **APIs**: Swagger/OpenAPI for every endpoint; canonical contract also in
  `contracts/openapi.yaml`.
- **UX**: Mobile-first, WCAG baseline; admin tables paginated with skeletons/spinners;
  **RHF + Zod** for forms (Redux for session + list cache per research.md §6).
- **Security & data**: JWT guards on admin routes; Zod client + class-validator server;
  **ObjectId references** for technologies; delete blocked when referenced (research.md §3).

## Project Structure

### Documentation (this feature)

```text
specs/001-headless-admin-api/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
├── spec.md
└── tasks.md              # Phase 2 — /speckit-tasks (not produced by this command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/                 # Passport JWT, login, guards
│   ├── users/                # Admin User schema + seed hook
│   ├── projects/
│   ├── technologies/
│   └── common/               # pipes, filters, pagination DTOs
├── test/                     # Jest e2e / integration
├── nest-cli.json
├── tsconfig.json
└── package.json

admin/
├── src/
│   ├── app/
│   ├── features/
│   │   ├── auth/
│   │   ├── projects/
│   │   └── technologies/
│   ├── components/           # atoms/molecules: Table, Modal, Field, Toast
│   ├── store/                # Redux slices + middleware for token persistence
│   └── lib/                  # api client, zod schemas
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: **Option 2 (web application)** — `backend/` hosts the NestJS
headless API; `admin/` hosts the Vite-based dashboard. The Lovable portfolio remains a
separate consumer using only public GET contracts.

## Phase Alignment (Execution Plan)

| Phase | Scope |
|-------|--------|
| **1** | NestJS bootstrap, config module, Mongoose connection, `User` / `Project` / `Technology` schemas, DTOs + validation pipes |
| **2** | Auth module (Passport JWT), bcrypt hashing, `JwtAuthGuard` on all POST/PUT/PATCH/DELETE admin routes |
| **3** | Public GET handlers + populated projects; technology CRUD; CORS for Lovable + admin origins |
| **4** | Admin SPA: Vite+TS+Tailwind+RTK, auth slice + persistence, shared UI primitives, login screen |
| **5** | Projects/technologies panels (tables, multi-select tech on project form), integration tests + manual cross-check vs public API |

Design artifacts **research.md**, **data-model.md**, **contracts/openapi.yaml**, and
**quickstart.md** support phases 1–3 and onboarding for 4–5.

## Complexity Tracking

No constitution violations requiring justification. Token storage uses `localStorage` with
documented hardening path (see `research.md` §2) per explicit execution preference while
keeping HTTPS + CSP as deployment requirements.
