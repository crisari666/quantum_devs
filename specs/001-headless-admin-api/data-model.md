# Data Model: Headless Catalog & Admin Console

**Feature**: `001-headless-admin-api`  
**Date**: 2026-05-08  
**Storage**: MongoDB via Mongoose (typed schemas)

## Entity: User (Administrator)

| Field | Type | Rules |
|-------|------|--------|
| `_id` | ObjectId | Auto |
| `email` | string | Required, unique, indexed (case-insensitive uniqueness recommended) |
| `passwordHash` | string | Required; never exposed in API responses |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

**Notes**: Seeded or manually created accounts only (per spec assumptions). Password verified
with bcrypt in auth service.

---

## Entity: Technology

| Field | Type | Rules |
|-------|------|--------|
| `_id` | ObjectId | Auto |
| `name` | string | Required; unique case-insensitive (see research.md) |
| `iconKey` | string | Required; stable key for Lucide/Font Awesome mapping in clients |
| `category` | string | Required; e.g. `Frontend`, `Backend`, `DevOps`, `Data`, `Other` |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

**Relationships**: Referenced by many `Project` documents via `technologies` array.

**Delete rule**: If any `Project` references this `_id`, **delete is blocked** (409).

---

## Entity: Project

| Field | Type | Rules |
|-------|------|--------|
| `_id` | ObjectId | Auto |
| `title` | string | Required; max length per DTO (e.g. 200) |
| `description` | string | Required; max length per DTO (e.g. 10_000) |
| `url` | string | Required; valid URL |
| `images` | string[] | Optional; each entry a URL or storage key; max array length enforced |
| `githubUrl` | string | Optional; valid URL if present |
| `featured` | boolean | Default `false` |
| `technologies` | ObjectId[] | References `Technology`; can be empty; populated on reads as needed |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

**Indexes**: Recommended index on `featured` + `createdAt` for public ordering; text index
optional for admin search (or application-level regex with care).

---

## Validation boundaries

- **HTTP write DTOs**: `class-validator` on all admin create/update bodies.
- **Mongoose**: Schema `required`, `maxlength`, URL patterns aligned with DTO limits.
- **Admin SPA**: Zod schemas mirroring server rules for immediate UX feedback.

---

## Public read shape (logical)

- **Project (public)**: All fields except internal-only additions; `technologies` resolved
  to embedded `{ _id, name, iconKey, category }[]`.
- **Technology (public)**: `{ _id, name, iconKey, category }`.
