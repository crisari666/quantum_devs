---
description: "Task list for Headless Catalog & Admin Console (001-headless-admin-api)"
---

# Tasks: Headless Catalog & Admin Console

**Input**: Design documents from `/specs/001-headless-admin-api/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Integration tests are included in the final phase per `plan.md` (phase 5) and `research.md` §5 (Jest + Supertest). No per-story TDD mandate in `spec.md`.

**Organization**: Phases follow user story priority (P1–P4) after shared setup and foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies on incomplete tasks in the same wave)
- **[Story]**: User story label `[US1]`…`[US4]` for story phases only
- Paths follow `plan.md` (`backend/`, `admin/`)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository layout, environment templates, and tooling alignment with the implementation plan.

- [ ] T001 Verify NestJS `backend/` layout matches `specs/001-headless-admin-api/plan.md` in `backend/src/app.module.ts` and feature folders under `backend/src/`
- [ ] T002 [P] Verify Vite admin layout matches `specs/001-headless-admin-api/plan.md` in `admin/src/app/` and `admin/src/features/`
- [ ] T003 Document `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` in `backend/.env.example` per `specs/001-headless-admin-api/quickstart.md`
- [ ] T004 [P] Document `VITE_API_BASE_URL` for local API base in `admin/.env.example` per `specs/001-headless-admin-api/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Runtime configuration, MongoDB connection, shared schemas, validation/Swagger bootstrap, and shared DTO primitives so user stories can attach controllers and UI.

**⚠️ CRITICAL**: User stories assume Mongoose models, global validation, and API documentation baseline from this phase.

- [ ] T005 Wire `ConfigModule` loading MongoDB, JWT, CORS, and seed-related env vars in `backend/src/app.module.ts`
- [ ] T006 Register `MongooseModule` connection using `MONGODB_URI` in `backend/src/app.module.ts`
- [ ] T007 [P] Implement `User` Mongoose schema (email unique, passwordHash, timestamps) in `backend/src/users/schemas/user.schema.ts` per `specs/001-headless-admin-api/data-model.md`
- [ ] T008 [P] Implement `Technology` Mongoose schema (name, iconKey, category, timestamps, indexes for uniqueness) in `backend/src/technologies/schemas/technology.schema.ts` per `specs/001-headless-admin-api/data-model.md` and `specs/001-headless-admin-api/research.md` §4
- [ ] T009 [P] Implement `Project` Mongoose schema (title, description, url, images, githubUrl, featured, technologies refs, timestamps, indexes) in `backend/src/projects/schemas/project.schema.ts` per `specs/001-headless-admin-api/data-model.md`
- [ ] T010 Implement admin user seed using `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `backend/src/seed/seed.service.ts` per `specs/001-headless-admin-api/quickstart.md`
- [ ] T011 Register global `ValidationPipe`, `/api` global prefix, and Swagger UI bootstrap in `backend/src/main.ts` per `specs/001-headless-admin-api/plan.md`
- [ ] T012 Implement shared pagination query DTO (`page`, `limit`, bounds) in `backend/src/common/dto/pagination-query.dto.ts` for admin list routes in `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T013 Add global HTTP exception filter or consistent error shape (optional message codes) in `backend/src/main.ts` or `backend/src/common/filters/` for FR-003/FR-010 friendly errors

**Checkpoint**: Database models exist, API boots with Swagger, validation active — public and admin work can proceed per story order.

---

## Phase 3: User Story 1 — Visitor discovers portfolio content (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated read-only catalog: full project list with populated technologies and full technology list, CORS-safe for approved origins, empty catalog returns success.

**Independent Test**: Call `GET /api/projects` and `GET /api/technologies` without `Authorization`; confirm shapes match `specs/001-headless-admin-api/contracts/openapi.yaml` and technologies are populated on projects; empty DB returns `[]` without error (spec edge case).

### Implementation for User Story 1

- [ ] T014 [US1] Implement `GET /api/projects` returning `ProjectPublic[]` with `technologies` populated in `backend/src/projects/projects.controller.ts` and `backend/src/projects/projects.service.ts` per `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T015 [P] [US1] Implement `GET /api/technologies` returning `TechnologyPublic[]` in `backend/src/technologies/technologies.controller.ts` and `backend/src/technologies/technologies.service.ts` per `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T016 [US1] Apply `CORS_ORIGINS` comma-separated allowlist for browser consumers (portfolio + admin origins) in `backend/src/main.ts` per FR-007/FR-008 and `specs/001-headless-admin-api/research.md` §1
- [ ] T017 [US1] Decorate public routes with `@nestjs/swagger` (`@ApiTags('Public')`, operation summaries) in `backend/src/projects/projects.controller.ts` and `backend/src/technologies/technologies.controller.ts` matching `specs/001-headless-admin-api/contracts/openapi.yaml`

**Checkpoint**: Public catalog is usable by the external portfolio with no auth — **MVP** if combined with seed data.

---

## Phase 4: User Story 2 — Administrator signs in securely (Priority: P2)

**Goal**: JWT Bearer auth for all administrative mutations and admin-only reads; login endpoint; admin SPA session persistence and login UX; anonymous access denied on protected routes (SC-004 / FR-003).

**Independent Test**: `POST /api/auth/login` with valid seed credentials returns `accessToken`; invalid credentials return 401; `GET /api/admin/projects` without token returns 401; with `Authorization: Bearer` succeeds.

### Implementation for User Story 2

- [ ] T018 [US2] Implement `POST /api/auth/login` with `class-validator` DTOs in `backend/src/auth/auth.controller.ts` and `backend/src/auth/dto/login.dto.ts` per `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T019 [US2] Issue JWT `accessToken` (and `expiresIn` if exposed) using bcrypt verify against `User` in `backend/src/auth/auth.service.ts` with `JwtModule` configuration in `backend/src/auth/auth.module.ts`
- [ ] T020 [US2] Implement `JwtStrategy` and `JwtAuthGuard` in `backend/src/auth/jwt.strategy.ts` and `backend/src/auth/jwt-auth.guard.ts`
- [ ] T021 [US2] Secure all `backend/src/projects/projects-admin.controller.ts` routes with `JwtAuthGuard` per FR-003
- [ ] T022 [US2] Secure all `backend/src/technologies/technologies-admin.controller.ts` routes with `JwtAuthGuard` per FR-003
- [ ] T023 [P] [US2] Implement Redux auth slice with `localStorage` persistence for Bearer token per `specs/001-headless-admin-api/research.md` §2 in `admin/src/store/` (e.g. `admin/src/store/authSlice.ts` or equivalent)
- [ ] T024 [US2] Build login screen using React Hook Form + Zod (no Redux for field state) with clear invalid-credential messaging in `admin/src/features/auth/` per constitution / `specs/001-headless-admin-api/research.md` §6

**Checkpoint**: Backend and admin agree on JWT; protected routes reject anonymous callers.

---

## Phase 5: User Story 3 — Administrator maintains projects (Priority: P3)

**Goal**: Paginated admin project list with text search, technology filter, featured filter; full CRUD; `ProjectWrite` with `technologyIds`; featured toggle; admin UI tables/forms; changes visible on public `GET /api/projects` (headless guarantee).

**Independent Test**: With JWT, exercise list filters, create/update/delete project, toggle featured, attach technologies; then public `GET /api/projects` reflects updates within same environment.

### Implementation for User Story 3

- [ ] T025 [US3] Implement `GET /api/admin/projects` with `page`, `limit`, `q`, `technologyId`, `featured` and `PaginatedProjects` response in `backend/src/projects/projects.service.ts` and `backend/src/projects/projects-admin.controller.ts` per FR-004 and `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T026 [US3] Define `ProjectWrite` DTO with `class-validator` limits (title/description/url/images/githubUrl/featured/technologyIds) in `backend/src/projects/dto/project-write.dto.ts` per FR-005 and `specs/001-headless-admin-api/data-model.md`
- [ ] T027 [US3] Implement `POST`, `GET/:id`, `PUT`, `DELETE` admin project handlers persisting technology associations in `backend/src/projects/projects-admin.controller.ts` and `backend/src/projects/projects.service.ts` per `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T028 [P] [US3] Implement admin projects list UI with pagination, visible loading states, and search/filter controls in `admin/src/features/projects/` per FR-010
- [ ] T029 [US3] Implement `ProjectForm.tsx` with RHF + Zod: featured toggle, multi-select technologies (existing catalog), field limits aligned to server in `admin/src/features/projects/ProjectForm.tsx` per FR-005
- [ ] T030 [US3] Align RTK Query or fetch layer with admin and public endpoints in `admin/src/lib/api.ts` per `specs/001-headless-admin-api/contracts/openapi.yaml`

**Checkpoint**: Administrators can manage projects end-to-end; portfolio public reads stay consistent.

---

## Phase 6: User Story 4 — Administrator maintains the technology catalog (Priority: P4)

**Goal**: Admin CRUD for technologies; duplicate name handling; delete blocked with 409 when still referenced by projects (`research.md` §3); selectors and public catalog stay coherent.

**Independent Test**: Create technology → appears in `GET /api/technologies` and project editor options; delete unused technology succeeds with 204; delete linked technology returns 409 with explanatory payload; duplicate create/update returns 409.

### Implementation for User Story 4

- [ ] T031 [US4] Implement `GET/POST /api/admin/technologies` with Swagger security in `backend/src/technologies/technologies-admin.controller.ts` per `specs/001-headless-admin-api/contracts/openapi.yaml`
- [ ] T032 [US4] Implement `PUT/DELETE /api/admin/technologies/:id` with duplicate-name `409` and referenced-delete `409` in `backend/src/technologies/technologies.service.ts` per `specs/001-headless-admin-api/research.md` §3–§4
- [ ] T033 [US4] Validate `TechnologyWrite` DTO in `backend/src/technologies/dto/technology-write.dto.ts` with parity to Zod on admin forms
- [ ] T034 [P] [US4] Build technologies admin screens (list, create/edit modal or page, delete confirm with server error display) in `admin/src/features/technologies/` per FR-006

**Checkpoint**: Technology catalog is fully manageable without orphaning project references.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Automated conformance, contract drift checks, session-expiry UX hooks, and quickstart validation across stories.

- [ ] T035 Extend Jest + Supertest coverage so 100% of unauthenticated mutations on admin routes return 401 in `backend/test/app.e2e-spec.ts` or dedicated `backend/test/auth-guard.e2e-spec.ts` per SC-004
- [ ] T036 [P] Add or extend Supertest flow: login → mutate project/technology → assert public `GET` reflects changes in `backend/test/headless-flow.e2e-spec.ts` per `specs/001-headless-admin-api/plan.md` phase 5
- [ ] T037 [P] Extend admin auth and projects API tests in `backend/test/auth.e2e-spec.ts` and `backend/test/projects-admin.e2e-spec.ts` to match `specs/001-headless-admin-api/contracts/openapi.yaml` status codes
- [ ] T038 [P] Extend technology admin tests for 409 duplicate and 409 in-use delete in `backend/test/technologies-admin.e2e-spec.ts` per `specs/001-headless-admin-api/data-model.md`
- [ ] T039 Handle expired JWT on admin API calls with actionable re-login prompt (no silent data loss where feasible) in `admin/src/lib/api.ts` and/or `admin/src/features/auth/` per spec edge cases
- [ ] T040 Audit `@nestjs/swagger` decorators vs `specs/001-headless-admin-api/contracts/openapi.yaml` for every controller under `backend/src/**/*.controller.ts`
- [ ] T041 Execute manual verification steps in `specs/001-headless-admin-api/quickstart.md` (backend + admin + curl public GET)

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 Setup
    →
Phase 2 Foundational (blocks all stories)
    →
Phase 3 US1 (P1) ──┐
    →              ├── Phase 4 US2 (P2) ──→ Phase 5 US3 (P3) ──┬── Phase 6 US4 (P4)
                   │                              ↑              │
                   └ (US1 can ship/demo before US2 if only reads needed)
                                                   └── US4 can parallel US3 after US2 if staffed separately (shared JWT only)
    →
Phase 7 Polish (after desired user stories complete)
```

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 — **blocks** all user story phases
- **US1 (Phase 3)**: Depends on Phase 2 only — no dependency on US2 for public GET handlers
- **US2 (Phase 4)**: Depends on Phase 2 — **blocks** US3 and US4 (JWT on admin routes)
- **US3 (Phase 5)**: Depends on US2 (authenticated admin project routes + admin UI auth)
- **US4 (Phase 6)**: Depends on US2; logically after or alongside US3 (technologies feed project editor)
- **Polish (Phase 7)**: Depends on US1–US4 scope you intend to ship

### User Story Dependency Graph

```text
US1 (public catalog)     independent after Foundation
US2 (auth)               independent after Foundation; prerequisite for US3/US4
US3 (projects admin)     depends on US2
US4 (technologies admin) depends on US2; soft-depends on US3 for editor UX verification
```

### Parallel Execution Examples

**After Phase 2 (Foundational)**

- Track A: T014–T017 (US1 public API + CORS + Swagger)
- Track B: T018–T024 (US2 auth backend + admin login)

**After US2 complete**

- T028 admin projects list UI [P] while T025–T027 backend admin projects [sequential service/controller work]
- T034 technologies UI [P] while T031–T033 technology service rules

**Polish**

- T036, T037, T038 marked [P] can run in parallel on different `backend/test/*.e2e-spec.ts` files

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1–2 (Setup + Foundational)
2. Complete Phase 3 (US1) — public catalog live for portfolio consumer
3. **STOP and VALIDATE** against `specs/001-headless-admin-api/quickstart.md` public GET steps

### Incremental Delivery

1. Add Phase 4 (US2) — secure admin channel
2. Add Phase 5 (US3) — project management + admin UI
3. Add Phase 6 (US4) — technology hygiene
4. Phase 7 — conformance, docs, hardening

### Format Validation

All tasks use the checklist pattern `- [ ] Tnnn …` with sequential IDs, optional `[P]`, story labels only on Phases 3–6, and explicit file paths in each description.

---

## Notes

- Keep `specs/001-headless-admin-api/contracts/openapi.yaml` the canonical HTTP contract; Nest routes MUST stay aligned (global prefix `/api` per contract `servers`).
- Image binaries stay out of scope for v1 per `spec.md` assumptions; store URL or storage key strings in `images` per `data-model.md`.
- Do not use `any` in TypeScript per constitution; mirror server rules with Zod on admin writes.
