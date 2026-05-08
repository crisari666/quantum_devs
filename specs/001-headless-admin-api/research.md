# Phase 0 Research: Headless Catalog & Admin Console

**Feature**: `001-headless-admin-api`  
**Date**: 2026-05-08

## 1. Trust model for public vs administrative access

**Decision**: Public catalog reads (`projects`, `technologies`) require **no end-user
authentication**. **JWT (Bearer)** protects all mutating routes and admin-only reads
(e.g. paginated admin list with filters). **CORS allowlist** enforces approved origins for
browser consumers (Lovable-hosted portfolio + admin app origin). Optional API keys for
machine clients are **out of scope** unless a later feature requires them.

**Rationale**: Matches FR-007/FR-008, minimizes friction for the portfolio site, and keeps
administration behind a single well-understood credential model aligned with the
constitution.

**Alternatives considered**: API key on public GETs (rejected: unnecessary for read-only
catalog with origin allowlist); GraphQL gateway (rejected: REST matches spec and team
plan).

---

## 2. Administrative token storage (SPA)

**Decision**: Store the short-lived **access JWT in `localStorage`**, attach via
`Authorization: Bearer`, and manage session expiry and logout in **Redux Toolkit** (auth
slice + listener or middleware). **HTTPS-only** deployment and strict **CSP** are required
operational controls. Document migration path to **httpOnly cookies** if XSS surface grows.

**Rationale**: Aligns with the agreed execution plan (Redux persistence). Constitution
allows documenting the tradeoff; httpOnly cookies remain the preferred hardening follow-up.

**Alternatives considered**: httpOnly cookie-only session (preferred for XSS, more moving
parts with cross-origin admin); in-memory only token (rejected: poor reload UX).

---

## 3. Deleting a technology still linked to projects

**Decision**: **Block delete** with `409 Conflict` and a message indicating how many
projects reference the technology. Administrator must detach or reassign first.

**Rationale**: Prevents silent broken public payloads and orphaned references; simplest
rule to explain in UI and tests.

**Alternatives considered**: Cascade remove from all projects (risky data loss); soft
delete only (adds state complexity for v1).

---

## 4. Duplicate technology names

**Decision**: Enforce **case-insensitive uniqueness** on `Technology.name` at the
database (unique index with normalized collation or application-level normalized key).

**Rationale**: Satisfies spec edge case without ambiguous duplicates in selectors.

**Alternatives considered**: Allow duplicates with UUID display only (rejected: poor admin
UX).

---

## 5. Testing strategy

**Decision**: **NestJS integration tests** (Jest + Supertest) against a test MongoDB
instance or in-memory Mongo for fast paths; contract checks against OpenAPI where
practical. **Manual or lightweight E2E** (scripted checklist or Playwright later) to
verify admin mutations reflect on public GETs (execution plan phase 5.3).

**Rationale**: Confirms headless guarantee without over-investing in UI automation before
the admin UI stabilizes.

**Alternatives considered**: UI-only E2E without API tests (rejected: weaker contract
safety).

---

## 6. Admin forms vs constitution (RHF + Zod)

**Decision**: Admin dashboard forms **MUST** use **React Hook Form + Zod** per
constitution, with Redux holding **server cache and auth**, not replacing form field state.

**Rationale**: Satisfies Principle V while preserving RTK for lists and session.

**Alternatives considered**: Redux-only form state (rejected: violates constitution).
