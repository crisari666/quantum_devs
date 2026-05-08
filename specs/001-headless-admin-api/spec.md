# Feature Specification: Headless Catalog & Admin Console

**Feature Branch**: `001-headless-admin-api`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: User description: "Headless backend as source of truth for an external portfolio experience and an internal admin console: public read access to projects (with linked skills), public skill catalog, authenticated full management of projects and skills, origin-based access control for the public site, and credential-based protection for all management actions."

Functional and non-functional requirements MUST remain consistent with
`.specify/memory/constitution.md` (portfolio plus admin delivery, type safety, documented
service contracts, validation discipline, protected administration, and UI/accessibility
expectations).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor discovers portfolio content (Priority: P1)

A visitor browsing the public portfolio experience needs to see curated projects and the
technologies behind each project, plus a complete list of available technologies for
browsing or filtering, without signing in.

**Why this priority**: The public catalog is the primary outward value; without it the
portfolio site cannot truthfully represent work.

**Independent Test**: Using only public, unauthenticated access, confirm that project
records and technology labels load completely and match stored authoritative data.

**Acceptance Scenarios**:

1. **Given** published projects exist with linked technologies, **When** a visitor opens
   the portfolio experience, **Then** they see every published project with correct titles,
   descriptions, links, imagery references, and associated technology names and
   categories.
2. **Given** the technology catalog contains entries, **When** a visitor requests the
   catalog view the portfolio relies on, **Then** they receive all technologies with stable
   names, categories, and visual identity keys suitable for downstream presentation.

---

### User Story 2 - Administrator signs in securely (Priority: P2)

An administrator opens the management console, signs in with dedicated credentials, and
receives a session that authorizes subsequent catalog changes until they sign out or the
session expires.

**Why this priority**: All write operations depend on trustworthy identity; it is a
prerequisite for safe administration.

**Independent Test**: Attempt sign-in with valid and invalid credentials; verify only
valid credentials yield an authorized session and that protected actions reject anonymous
users.

**Acceptance Scenarios**:

1. **Given** a valid administrator account, **When** they submit correct credentials,
   **Then** they reach the console home and subsequent protected actions succeed until
   session end.
2. **Given** incorrect credentials or an anonymous user, **When** they attempt to access
   protected management screens or change data, **Then** access is denied with a clear,
   non-leaking error state.

---

### User Story 3 - Administrator maintains projects (Priority: P3)

An authenticated administrator lists projects, searches and filters them (including by
technology), marks projects as featured, and creates, edits, or removes projects—including
linking any number of existing technologies to each project via a multi-select style
workflow.

**Why this priority**: Project records are the core managed asset after authentication.

**Independent Test**: With an authorized session, perform full create/read/update/delete on
projects including featured toggling and technology associations; confirm public views
reflect changes.

**Acceptance Scenarios**:

1. **Given** an authorized session, **When** the administrator saves a new project with
   title, narrative, outbound links, ordered imagery references, optional source-code link,
   featured flag, and selected technologies, **Then** the project appears in admin lists
   and in the public catalog with matching data.
2. **Given** multiple projects and a populated technology catalog, **When** the
   administrator filters by a technology or searches by text, **Then** the list narrows to
   matching projects without dropping unrelated records incorrectly.
3. **Given** an authorized session, **When** the administrator toggles featured on a
   project, **Then** downstream consumers can distinguish featured projects from others
   consistently.

---

### User Story 4 - Administrator maintains the technology catalog (Priority: P4)

An authenticated administrator adds or removes technologies that appear as selectable
options when editing projects, keeping names, categories, and icon identity keys accurate.

**Why this priority**: Technology hygiene keeps project editing trustworthy and the public
stack display coherent.

**Independent Test**: Add and remove technologies and confirm the project editor options
and public catalog update accordingly without orphaning active project links in an
undefined state (see edge cases).

**Acceptance Scenarios**:

1. **Given** an authorized session, **When** the administrator adds a technology with
   name, category, and icon identity key, **Then** it becomes selectable on project forms
   and appears in the public technology catalog.
2. **Given** a technology not linked to any project, **When** the administrator deletes it,
   **Then** it disappears from selectors and public catalogs without breaking unrelated
   data.

---

### Edge Cases

- Public request arrives while no projects exist: response is successful with an empty
  collection and no errors surfaced to visitors.
- Administrator deletes a technology still linked to projects: system MUST either block
  deletion with a clear explanation or define a safe cascade behavior that preserves
  project integrity (choose one behavior and document it in planning).
- Session expires mid-edit: user receives an actionable prompt to re-authenticate without
  silent data loss where possible.
- Duplicate technology names: creation or update MUST be rejected or de-duplicated per
  agreed catalog rules.
- Oversized media lists or very long text fields: validation limits and friendly errors
  MUST prevent broken saves.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose an unauthenticated read path for the full project
  catalog, including each project’s linked technologies with human-readable names and
  categories suitable for display and filtering on the public portfolio experience.
- **FR-002**: The system MUST expose an unauthenticated read path for the full technology
  catalog used by the public portfolio for stacks and filters.
- **FR-003**: The system MUST restrict all create, update, and delete operations on
  projects and technologies to authenticated administrators only.
- **FR-004**: The system MUST allow administrators to list projects with text search,
  filter by linked technology, and toggle a featured flag persisted with the project.
- **FR-005**: The system MUST allow administrators to create and edit projects with fields
  for title, description, primary outbound URL, ordered image references, optional public
  source repository URL, featured status, and many-to-many association to existing
  technologies through a multi-select workflow.
- **FR-006**: The system MUST allow administrators to add and remove technologies, each
  with name, category label, and a stable visual identity key for presentation mapping.
- **FR-007**: The system MUST enforce network access rules so only approved public
  portfolio origins may consume unauthenticated read traffic, while administrative
  traffic remains protected independently of visitor access.
- **FR-008**: The system MUST support two trust levels for programmatic access: open read
  for approved public origins, and credential-backed access for administrative changes
  (exact mechanism recorded during planning to align with security review).
- **FR-009**: Administrative clients MUST persist session credentials through a single
  documented client-side strategy so reloads do not silently lose authorization until
  expiry or sign-out.
- **FR-010**: Administrative list views MUST paginate or otherwise bound result sets so
  large catalogs remain usable; loading states MUST be visible during fetches.

### Key Entities *(include if feature involves data)*

- **Project**: Represents a portfolio entry with title, narrative description, primary
  public URL, ordered collection of image references, optional public source URL, boolean
  featured flag, and a set of linked **Technology** records.
- **Technology**: Represents a skill or stack item with display name, category (for
  example Frontend, Backend, or other agreed taxonomy), and an icon identity key mapped by
  presentation layers to visual libraries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a typical broadband connection, a visitor loads the complete project list
  with linked technology names in under three seconds for catalogs up to one hundred
  projects.
- **SC-002**: At least ninety-five percent of valid administrative save attempts (project
  or technology) complete successfully in usability testing sessions without unintended
  data loss.
- **SC-003**: With up to one hundred projects, an administrator locates a target project
  using search or technology filter within one minute in moderated tests.
- **SC-004**: One hundred percent of attempted administrative mutations without a valid
  session are rejected in automated conformance checks.

## Assumptions

- A separately hosted portfolio experience consumes the public read paths; this feature is
  the authoritative catalog for that experience.
- Administrator accounts are few and manually provisioned; self-service public registration
  is out of scope unless added later.
- Image binaries may be stored elsewhere; this feature tracks references (URLs or storage
  keys) sufficient for the portfolio to render media.
- Detailed transport documentation for each read and write surface will be produced during
  planning to satisfy organizational API documentation standards.
