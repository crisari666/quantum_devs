<!--
Sync Impact Report
- Version change: (unversioned placeholders) → 1.0.0
- Modified principles: N/A (initial adoption from template placeholders)
- Added sections: Technology Stack & Platform Constraints; Data, Security & Content Model
- Removed sections: None (template placeholders replaced)
- Templates: .specify/templates/plan-template.md ✅ updated | .specify/templates/spec-template.md ✅ updated | .specify/templates/tasks-template.md ✅ updated | .specify/templates/commands/*.md — not present (no changes)
- Deferred: None
-->

# Quantum Devs Portfolio Platform Constitution

## Core Principles

### I. Clean Architecture & Clear Boundaries

The system MUST deliver a high-performance public portfolio and a robust administrative
dashboard for dynamic management of projects, work experience, and skills. Backend code
MUST follow service-oriented layering: controllers (HTTP), services (domain/application
logic), and data access (repositories or Mongoose gateways) MUST remain separated with
explicit module boundaries in NestJS. Frontend code MUST favor atomic design: reusable
atoms/molecules/organisms with pages composing them, not monolithic screens. Rationale:
separation enables testing, scaling teams, and evolving the portfolio and admin surfaces
independently.

### II. Type Safety (NON-NEGOTIABLE)

TypeScript MUST run in strict mode on both frontend and backend. The type `any` is
PROHIBITED except where the language absolutely requires escape hatches—and those MUST be
narrowed immediately at the boundary and documented. All request/response shapes, domain
models exposed across layers, and Mongoose documents intended for application logic MUST
use explicit interfaces, DTO classes, or inferred types from `satisfies` / generics—never
untyped bags. Rationale: the stack’s complexity (admin CRUD, JWT, Redux) demands compile-time
guarantees to prevent regressions.

### III. DRY & KISS

Duplicated business rules, validation logic, and UI patterns MUST be consolidated into
shared utilities, hooks, pipes, or services as appropriate. Implementations MUST prefer the
simplest design that meets requirements; speculative abstractions and deep inheritance
hierarchies are FORBIDDEN unless justified in planning artifacts. Rationale: a portfolio
and admin product changes often; small, obvious code paths reduce maintenance cost.

### IV. Documented API Surface

Every HTTP endpoint exposed by the NestJS application MUST be described in Swagger /
OpenAPI (e.g. `@ApiTags`, `@ApiOperation`, DTO decorators) so that contracts are discoverable
and reviewable without reading implementation. Breaking changes to documented contracts
MUST be treated as versioned or coordinated releases per governance. Rationale: admin and
public clients depend on stable, inspectable APIs.

### V. Professional UX, Accessibility & Admin Ergonomics

Visual design MUST be minimalist, professional, and developer-centric. Layouts MUST be
mobile-first and responsive. Interactive surfaces MUST meet baseline WCAG expectations
(keyboard operability, labels, contrast, focus). The admin dashboard MUST use paginated
tables, forms built with React Hook Form plus Zod schemas, and clear loading feedback
(skeletons or spinners)—never silent failures. Rationale: the product represents technical
craft; accessibility and admin UX are part of deliverable quality, not polish-only work.

## Technology Stack & Platform Constraints

These choices are binding for new work unless explicitly amended.

- **Public & admin frontend**: React 18 or newer, TypeScript (strict), Redux Toolkit for
  global state, Tailwind CSS for styling, atomic component structure as in Principle I.
- **Backend**: NestJS on Node.js with TypeScript; decorators and Nest modules for routing,
  validation, and DI; clear feature modules per domain (e.g. content, auth).
- **Database**: MongoDB with Mongoose; schemas MUST be typed and validated (schema options,
  class-validator at boundaries where applicable) so documents match application types.
- **Performance & scalability**: Prefer lean bundles, efficient data fetching for the
  portfolio, and pagination/filtering on admin list endpoints; avoid unbounded queries.

## Data, Security & Content Model

- **Authentication**: Administrative routes MUST be protected with JWT; tokens MUST be
  handled according to OWASP-oriented practices (httpOnly cookies or secure storage
  patterns as chosen in implementation plans—document the decision in plan/spec).
- **Validation**: User input MUST be validated on the client with Zod (aligned with React
  Hook Form) and on the server with `class-validator` / Nest pipes for all write paths.
- **MongoDB modeling**: Entity relationships MUST use references (`ObjectId`) where
  cardinality or reuse demands it; deeply nested document trees that obscure queryability
  or encourage unbounded growth are FORBIDDEN unless justified in design artifacts.
- **Dynamic content**: Projects, experience, and skills MUST be manageable through the admin
  API and persisted in MongoDB with audit-friendly fields (e.g. timestamps) as defined in
  the data model for each feature.

## Governance

This constitution supersedes ad-hoc conventions for the Quantum Devs portfolio platform.
All feature specifications, implementation plans, and task lists MUST be checked against
these principles before implementation begins and again before release.

- **Amendments**: Proposed changes MUST be recorded in this file with version bump, date, and
  rationale; dependent templates (plan, spec, tasks) MUST be reconciled in the same change
  set when gates or mandatory practices shift.
- **Versioning**: Follow semantic versioning for this document: MAJOR for incompatible
  governance or removed/redefined principles; MINOR for new principles or materially expanded
  guidance; PATCH for clarifications and non-semantic wording.
- **Compliance**: Code review MUST verify type safety (no `any`), Swagger coverage for new
  endpoints, validation on write paths, and UI responsiveness/accessibility for user-facing
  changes. Deviations require explicit documented justification in the feature plan’s
  complexity or constitution check section.

**Version**: 1.0.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
