# Tasks: Headless Catalog & Admin Console

**Input**: Design documents from `/specs/001-headless-admin-api/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Integration tests (Jest + Supertest) per research.md §5 and plan.md Phase 5.

**Organization**: Tasks grouped by user story (P1–P4) after shared setup and foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label for story-phase tasks only

## Path Conventions

- **Backend**: `backend/` (NestJS)
- **Admin**: `admin/` (Vite + React)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository ignore files, NestJS API shell, admin SPA shell, toolchain

- [x] T001 Verify or extend root `.gitignore` for Node, `.env*`, `dist/`, `coverage/`, `.DS_Store`
- [x] T002 Scaffold NestJS app in `backend/` (`package.json`, `nest-cli.json`, `tsconfig*.json`, `src/main.ts`, `src/app.module.ts`)
- [x] T003 [P] Scaffold Vite React TypeScript app in `admin/` (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`)
- [x] T004 [P] Add Tailwind CSS to `admin/` (`tailwind.config.ts`, `postcss.config.js`, wire in `src/index.css`)
- [x] T005 [P] Add ESLint/Prettier configs aligned with strict TypeScript for `backend/` and `admin/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Config, MongoDB, shared validation/Swagger/CORS, Mongoose schemas for User, Project, Technology

**⚠️ CRITICAL**: No user story work until this phase completes

- [x] T006 Add `backend/.env.example` with `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, optional `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` documented in `backend/README.md`
- [x] T007 Install backend deps: `@nestjs/config`, `@nestjs/mongoose`, `mongoose`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `bcrypt`, `rxjs`
- [x] T008 Register `ConfigModule` and global `ValidationPipe` in `backend/src/main.ts` and `backend/src/app.module.ts`; set global API prefix `api` and Swagger at `/api/docs`
- [x] T009 Configure CORS allowlist from `CORS_ORIGINS` in `backend/src/main.ts`
- [x] T010 Add `backend/src/common/` pagination DTOs and exception filter if needed (`backend/src/common/dto/pagination-query.dto.ts`, `backend/src/common/filters/http-exception.filter.ts`)
- [x] T011 Implement `User` Mongoose schema and `UsersModule` (`backend/src/users/schemas/user.schema.ts`, `backend/src/users/users.module.ts`, `backend/src/users/users.service.ts`) — password hash never exposed
- [x] T012 [P] Implement `Technology` schema + `TechnologiesModule` skeleton (`backend/src/technologies/schemas/technology.schema.ts`, `backend/src/technologies/technologies.module.ts`)
- [x] T013 [P] Implement `Project` schema with `technologies` ObjectId refs (`backend/src/projects/schemas/project.schema.ts`, `backend/src/projects/projects.module.ts`)
- [x] T014 Add startup seed hook for admin user when env vars set (`backend/src/users/users.service.ts` or `backend/src/seed/seed.service.ts` wired from `app.module.ts`)

**Checkpoint**: Database models and app bootstrap ready

---

## Phase 3: User Story 1 — Public catalog (Priority: P1)

**Goal**: Unauthenticated `GET /api/projects` and `GET /api/technologies` with populated technologies per OpenAPI

**Independent Test**: curl public endpoints; empty arrays when no data; shapes match `contracts/openapi.yaml`

### Implementation for User Story 1

- [x] T015 [US1] Add public list handler for projects with `populate('technologies')` in `backend/src/projects/projects.controller.ts` and `backend/src/projects/projects.service.ts` (route `GET /projects` under global prefix → `/api/projects`)
- [x] T016 [US1] Add public list handler for technologies in `backend/src/technologies/technologies.controller.ts` and `backend/src/technologies/technologies.service.ts` (`GET /technologies`)
- [x] T017 [US1] Map responses to public DTOs/Swagger decorators matching `TechnologyPublic` and `ProjectPublic` in `backend/src/projects/dto/` and `backend/src/technologies/dto/`

**Checkpoint**: Public reads work without JWT

---

## Phase 4: User Story 2 — Administrator auth (Priority: P2)

**Goal**: `POST /api/auth/login`, JWT issuance, guards rejecting unauthenticated admin routes

**Independent Test**: Login success/failure; `401` on protected routes without Bearer token

### Tests for User Story 2

- [x] T018 [P] [US2] Add integration test for login and unauthorized access in `backend/test/auth.e2e-spec.ts`

### Implementation for User Story 2

- [x] T019 [US2] Implement `AuthModule` with `JwtModule`, `PassportModule`, JWT strategy (`backend/src/auth/auth.module.ts`, `backend/src/auth/jwt.strategy.ts`, `backend/src/auth/auth.service.ts`)
- [x] T020 [US2] Implement `POST /auth/login` controller method with bcrypt verify and Swagger in `backend/src/auth/auth.controller.ts`
- [x] T021 [US2] Implement `JwtAuthGuard` and apply to all `/admin/*` routes in `backend/src/auth/jwt-auth.guard.ts` (controllers under admin paths)

**Checkpoint**: JWT protects admin namespace

---

## Phase 5: User Story 3 — Administrator projects (Priority: P3)

**Goal**: Paginated admin project list with `q`, `technologyId`, `featured`; full CRUD; writes match `ProjectWrite` / `ProjectAdmin`

**Independent Test**: Swagger with Bearer: list filter search, create/update/delete; public GET reflects changes

### Tests for User Story 3

- [x] T022 [P] [US3] Add integration tests for admin projects CRUD and pagination in `backend/test/projects-admin.e2e-spec.ts`

### Implementation for User Story 3

- [x] T023 [US3] Implement `GET/POST /admin/projects` and `GET/PUT/DELETE /admin/projects/:id` in `backend/src/projects/projects-admin.controller.ts` (or dedicated controller file) with `PaginatedProjects` response
- [x] T024 [US3] Implement query filtering, text search, and featured flag in `backend/src/projects/projects.service.ts`
- [x] T025 [US3] Add `class-validator` DTOs for create/update bodies (`backend/src/projects/dto/project-write.dto.ts`) and wire 400 validation errors

**Checkpoint**: Projects manageable with JWT; public catalog stays consistent

---

## Phase 6: User Story 4 — Administrator technologies (Priority: P4)

**Goal**: Admin technology list/create/update/delete; duplicate name `409`; delete blocked with `409` when referenced (research.md §3)

**Independent Test**: CRUD technologies; delete blocked when project links; case-insensitive unique name

### Tests for User Story 4

- [x] T026 [P] [US4] Add integration tests for technology CRUD, duplicate name, and delete conflict in `backend/test/technologies-admin.e2e-spec.ts`

### Implementation for User Story 4

- [x] T027 [US4] Implement `GET/POST /admin/technologies` and `PUT/DELETE /admin/technologies/:id` in `backend/src/technologies/technologies-admin.controller.ts` with Swagger
- [x] T028 [US4] Enforce case-insensitive unique `name` and delete guard when projects reference id in `backend/src/technologies/technologies.service.ts`

**Checkpoint**: Technology catalog admin complete

---

## Phase 7: Admin SPA (cross-cutting UI)

**Purpose**: Vite admin: Redux auth + persistence, API client, login, projects and technologies panels per plan Phase 4–5

- [x] T029 Add `admin/.env.example` with `VITE_API_BASE_URL` documented in `admin/README.md`
- [x] T030 Install admin deps: `@reduxjs/toolkit`, `react-redux`, `react-hook-form`, `zod`, `@hookform/resolvers`, `tailwindcss`, `clsx` (as needed)
- [x] T031 Configure RTK store with auth slice and localStorage persistence in `admin/src/store/store.ts` and `admin/src/store/authSlice.ts`
- [x] T032 [P] Add API client with base URL and Bearer injection in `admin/src/lib/api.ts`
- [x] T033 [P] Add Zod schemas mirroring write DTOs in `admin/src/lib/schemas/projectWrite.ts` and `admin/src/lib/schemas/technologyWrite.ts`
- [x] T034 Implement login page with RHF+Zod in `admin/src/features/auth/LoginPage.tsx` and route wiring in `admin/src/app/App.tsx`
- [x] T035 Implement projects list with pagination, search, technology filter, featured toggle UI in `admin/src/features/projects/ProjectsPage.tsx` (RTK Query or fetch + slice per plan)
- [x] T036 Implement project create/edit form with technology multi-select (RHF+Zod) in `admin/src/features/projects/ProjectForm.tsx`
- [x] T037 Implement technologies CRUD screens in `admin/src/features/technologies/TechnologiesPage.tsx` with loading states and error toasts
- [x] T038 [P] Add shared UI primitives (table skeleton, button, input) under `admin/src/components/` for constitution UX baseline

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T039 [P] Add end-to-end integration test: login → create project → public GET sees data in `backend/test/headless-flow.e2e-spec.ts`
- [x] T040 Align `contracts/openapi.yaml` with any final response tweaks and export if needed (no drift) — update `specs/001-headless-admin-api/contracts/openapi.yaml` only if code required contract fixes
- [x] T041 [P] Document seed credentials and curl examples in `specs/001-headless-admin-api/quickstart.md` if dev defaults differ
- [x] T042 Run `npm test` in `backend/` and `npm run build` in `backend/` and `admin/`; fix failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phases 3–6** (US1 can follow foundation; US2 required before US3–US4 admin routes; US3/US4 need US2 for guards)
- **US1 (T015–T017)** can follow Phase 2 without auth
- **US2 (T018–T021)** after Phase 2; blocks US3–US4 and most of Phase 7
- **US3** after US2; **US4** after US2 (can parallel US3/US4 backend after T021)
- **Phase 7** after backend US2 minimum (login); full panels after US3–US4
- **Phase 8** after core features

### User Story Dependencies

- **US1**: After Phase 2
- **US2**: After Phase 2; prerequisite for admin mutations
- **US3**, **US4**: After US2

### Parallel Opportunities

- T003/T004/T005; T012/T013; T018/T022/T026 (tests in separate files); T032/T033/T038

---

## Parallel Example: User Story 2

```bash
# After T019 implemented, run test task:
npm run test -- --testPathPattern=auth.e2e-spec
```

---

## Implementation Strategy

### MVP First

1. Phases 1–2  
2. Phase 3 (US1) — public catalog  
3. Phase 4 (US2) — auth  
4. Validate with Swagger + curl  

### Incremental Delivery

Add US3 → US4 → Admin SPA (Phase 7) → Polish (Phase 8)

---

## Notes

- All admin write/list routes MUST have Swagger decorators (constitution)
- No `any` in TypeScript (constitution)
- Technology delete: **409** if referenced (data-model.md)
