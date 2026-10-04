# iCollege Project Architecture

Architecture and security snapshot after the multi-university foundation work, 2 October 2026. This describes the repository as inspected and changed in this work; it does not imply that a production migration or external university integration has been run.

## Product and repository

iCollege is a student mobile application and shared student platform. The repository is a monorepo with an Expo/React Native client in `frontend/` and a Node.js API in `backend/`. `README.md`, `docs/API_CONTRACT.md`, and `docs/BUILD_PLAN.md` are supporting documentation. The frontend uses JavaScript/JSX, Expo Router, React Native, Expo SecureStore, Expo Image/Video and local React state/context. The backend uses Node.js ES modules, Express, Knex, PostgreSQL, bcryptjs, JWT, Multer and Nodemailer.

## Main components and request flow

```text
Expo screen / component
  -> frontend/src/lib/api/* -> shared apiFetch (bearer access token, refresh)
  -> Express /api route -> authentication / role check
  -> domain service -> Knex query -> PostgreSQL
  -> JSON response -> screen state / contexts
```

Screens live under `frontend/src/app/`; shared presentation under `frontend/src/components/`; API wrappers and auth state under `frontend/src/lib/`. Expo Router provides file-based navigation, and `src/config/navigation.js` centralizes drawer destinations. Theme and notification contexts provide app-wide UI state. There is no general-purpose query cache; individual screens and `useApi`/polling hooks own most fetched state.

The API router is split into auth, academic, admin, AI/search, career, chat, clubs, community, documents, employer, lecturer, notifications and reels route modules. Route handlers delegate most persistence and business rules to `backend/src/services/`. `backend/src/db/migrations/` defines schema history; `backend/src/db/seeds/001_seed_demo.js` populates demonstrator data.

## Current data and tenant model

Migration `0015_multi_university_identity.js` adds universities, campuses, departments and programmes. Users now have a required `university_id`, optional campus/department/programme identifiers and `student_year`. A student may have course enrollments through `student_course_enrollments` with academic year, term and status. Courses, notices, chambers, clubs, events, opportunities, chat threads and projects carry tenant/scope data; stories and reels declare national or university visibility. University integrations store protocol/configuration metadata and a secret-manager reference, not credential material.

Database composite foreign keys bind user placement and student-course enrollment to the same university. Course, notice and chamber department/course associations are similarly constrained. Tenant identifiers are also used in backend service queries. `visibleChamber` and `visibleNotice` encode national, university, department and active-course visibility predicates.

Migration 0015 has been applied to the configured local `icollege` database. Its 20 original users and other historical rows are assigned to `legacy-unassigned` with status `provisioning`; no institution is guessed from email or student-number patterns, and these accounts cannot authenticate until an operator verifies and maps them. The destructive full demo seed was not run. The demo seed assigns demo data to active ICU and ARU tenants. Production rollout still requires backup/restore rehearsal and an authorized legacy reconciliation plan.

For local auth/tenant testing, `npm run seed:testing` adds two dedicated test tenants and fixtures without clearing legacy or application data. It is disabled in production and documents credentials only for this local test dataset.

Historical opportunities and projects also default to university-only visibility because their provenance is unknown. Only explicitly seeded demo career listings/projects or newly authorized national content are shared across universities.

Migration 0015 refuses rollback after a real tenant, course enrollment or integration exists, because reversing tenant identity after use could discard information or reintroduce collisions. Restore a tested pre-migration backup for recovery after tenant use; rehearse the migration itself against a restored copy.

## Authentication and authorization

The local iCollege login path uses student ID, password and (when needed) a university slug. Passwords are bcrypt hashes. Successful login issues a 15-minute access JWT and a random 30-day refresh token; only the refresh-token hash is stored. Refresh rotation consumes the existing row transactionally and checks that both user and university remain active. `requireAuth` reloads current status, role and university on protected requests and compares the JWT tenant claim with the database tenant. This enables immediate account/tenant suspension and role changes at the cost of one database lookup per authenticated request.

Signup is student-only and requires an active university selection; accounts remain pending until university approval. It accepts optional academic placement only after checking that IDs belong to the selected institution. This does not verify enrollment in a university registry. Password reset codes are hashed and expire after ten minutes; configured mail sends codes, while development may return a code for testing. Native sessions use SecureStore; web uses browser storage and therefore requires careful XSS defenses.

New installations have a one-time environment-driven platform-admin bootstrap command. It creates the first active institution/admin only when no active platform admin exists, and hashes the supplied initial password. Existing legacy records remain quarantined until separately verified.

There is no live OIDC, SAML, SIS or LMS integration adapter. Integration rows are disabled metadata placeholders. The app must not collect or forward university passwords to undocumented services. A university-approved identity protocol can be added per institution after its metadata, claims and account-linking rules are verified.

## API, visibility and data flow

The shared client wrapper adds bearer tokens and retries an unauthorized call after refresh. Express applies request IDs, basic security headers, JSON parsing and an origin allowlist (`CORS_ORIGINS`, with development localhost defaults); native requests without an Origin header are accepted. Routes authenticate before services run. Services scope academic and administrative records by the server-resolved tenant, and public/shared queries must explicitly request a supported visibility level. National opportunities/projects/communities intentionally span tenants; university content is limited to the current institution, and course visibility uses active enrollment.

Signed media links expire quickly and map through authenticated API handlers that re-check viewer and content scope. Document downloads use a signed short-lived link and service authorization (owner or permitted tenant course staff/enrollee). Uploads use random file names, a MIME allowlist and size limits; the old public static `/uploads` mount was removed. The stored MIME declaration is still client supplied and there is no malware scanning or media transcoding.

## Storage, performance and operations

PostgreSQL is the system of record, accessed through Knex. Migration 0015 adds composite uniqueness/foreign keys and indexes for feed, timetable, exams, notices, comments, documents, chat, stories and opportunities. Local disk remains the upload store. Reels are capped at 40 and stories at 300 fetched items; several older list APIs still have fixed limits or no cursor pagination. Chat thread lists perform per-thread queries. The backend has request correlation IDs and sanitized JSON errors, but no production structured logger, metrics, tracing, distributed rate limiter, background queue, object store or CDN.

## Strengths

- Clear client/API/domain-service separation and centralized API client.
- Password and refresh secrets are hashed; refresh rotation is transactional.
- Tenant identity is explicit, checked on authenticated requests, and reinforced with composite foreign keys.
- Sensitive files no longer rely on an unguessable path for privacy; short-lived links recheck access.
- University, department and course visibility are represented explicitly rather than inferred in the UI.
- Admin endpoints separate platform-level actions from university-scoped management in most areas.
- Initial platform-admin and institution-admin provisioning has explicit protected workflows.
- Demo seed covers two universities and national community categories.

## Weaknesses and remaining design work

- The migration quarantines existing users/content. Institution attribution, production cutover, backup/restore rehearsal and a reviewed reconciliation procedure remain necessary before deployment.
- University SSO/SIS/LMS adapters are not implemented; student enrollment still needs verified institution-admin or SIS provisioning.
- Tenant filtering is application-enforced as well as constrained by selected composite FKs. PostgreSQL row-level security and a comprehensive route-by-route database integration suite remain defense-in-depth opportunities.
- Some national student features (stories, reels, projects, opportunities) are intentionally globally visible and need product moderation, privacy controls and abuse-report workflows.
- Profiles lack a full visibility model; national talent discovery is opt-in but applicant identity disclosure needs explicit product/privacy policy.
- Video upload has no transcoding, thumbnail generation, adaptive streaming, CDN, cleanup or deep content validation.
- Pagination, caching and query-count optimization are incomplete; chat list generation has an N+1 pattern.
- Rate limiting, production logging/metrics, account recovery abuse controls and content moderation tooling need production hardening.
- Automated tests currently cover signed-link integrity/expiry and compiled tenant visibility predicates. Database-backed end-to-end and cross-tenant request tests need a provisioned isolated PostgreSQL test database.

See [PROJECT_AUDIT_AND_PHASE_STATUS.md](PROJECT_AUDIT_AND_PHASE_STATUS.md) for audit findings, severity and phase completion status.
