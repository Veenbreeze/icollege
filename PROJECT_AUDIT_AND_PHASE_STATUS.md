# iCollege Codebase Audit and Phase Status

Audit date: 2 October 2026. Scope: repository source, migrations, API routes/services, frontend navigation/state/API wrappers, file storage, documentation and available local validation. This is a source audit, not a penetration test or production database review. Findings distinguish defects fixed here from remaining release work.

## Executive summary

The original application had no institution identity boundary, served uploads from a public static path, accepted user-selected roles at signup and did not bind sessions to a tenant. This change establishes a shared-platform tenant foundation, scopes the reviewed academic/community/career/admin queries, makes uploaded content private behind short-lived signed links, changes signup to pending student-only accounts, and adds focused tests. No real university credential protocol has been invented.

The change is not ready for production cutover until migration 0015 is rehearsed on a backup/restore copy, existing data is mapped by an authorized institution owner, real institutional enrollment/admin provisioning is defined, and route-level tests run against a provisioned isolated PostgreSQL instance. Video delivery, full moderation/privacy controls, rate limiting, production observability and complete UI verification remain open.

## Severity-ranked findings

| Severity | Area | Finding and impact | Status / evidence |
|---|---|---|---|
| Critical (before multi-tenant release) | Database/data migration | Historical records have no trustworthy university attribution. Guessing from student ID or email could disclose academic/community data to the wrong institution. | Fixed safely by assigning historical rows to a non-authenticating `legacy-unassigned` provisioning tenant. **Operator mapping and production migration remain required.** `backend/src/db/migrations/0015_multi_university_identity.js`. |
| Critical (before multi-tenant release) | Tenant boundary | Previously there was no university column or server tenant predicate; frontend filters could not provide isolation. | Implemented tenant ID on identity and tenant-owned records, server-resolved JWT context, scoped services and composite tenant foreign keys. Tests currently inspect compiled predicates, not live endpoint behavior. |
| Critical (before multi-tenant release) | Legacy visibility | Legacy opportunity/project rows have unknown institutional provenance and must not silently become national content. | Fixed: migration defaults historical opportunities/projects to university-only. Demo seed explicitly marks known demonstration career content national; employer-created opportunities default university unless the employer chooses national. |
| High | File storage | Previously `/uploads` was publicly served, so knowledge of a path bypassed account/tenant permissions. | Fixed by removing static exposure, restricting upload MIME declarations and serving files through signed links with scope rechecks. Residual: signed links are bearer capabilities until expiry; file bytes are not scanned or deeply type-verified. |
| High | Authentication | Signup previously accepted a role field and lacked institution selection; refresh rotation was non-atomic. | Fixed: student-only pending registration, university slug selection, active institution checks, current DB role/status reload and transactional one-time refresh-token consumption. No live university SSO exists. |
| High | Authentication/recovery | Reset-code consumption could race, allowing parallel requests to reuse a code. | Fixed with a row lock and atomic `used_at` update in one transaction; password length is bounded. Rate limiting and delivery abuse controls remain open. |
| High | API authorization | Employer applicant lists returned identifiable student data without rechecking company verification. Company verification was available to university admins despite being platform-wide. | Fixed: applicant listing requires a verified company and verification endpoint is platform-admin-only. Privacy disclosure policy for applicants remains a product decision. |
| Medium | Course document permissions | Authenticated non-academic roles could list same-university course-material metadata; lecturer access to another uploader's material also had an incorrect role branch. | Fixed: materials require active student enrollment, assigned lecturer, or university/platform admin; lecturer downloads require assignment to that course. |
| High | Cross-tenant content discovery | Author-post and project-search paths were not consistently applying national/university/department/course visibility predicates. | Fixed during audit: author posts now use the shared chamber predicate; project search now returns only national or current-university projects. Department ID is loaded into the request principal so scoped department content works. |
| High | Academic identity | Programme/year fields alone could not represent campus, department, programme placement and course enrollment consistently. | Fixed schema and admin-managed academic identity endpoint with same-tenant validation and enrollment FKs. SIS verification and production data quality/reconciliation remain open. |
| High | Integration | Adding unofficial credential endpoints or storing campus passwords would create credential risk and unreliable authentication. | No fake API added. Disabled integration metadata supports OIDC/SAML/SIS/LMS configuration references only. Protocol adapters, secret-manager hookup and institutional verification remain unimplemented. |
| Medium | Abuse/security controls | Login, signup, password recovery, posts, comments and uploads have no distributed request-rate or abuse controls. | Open. Add shared rate limiting, account lockout/abuse monitoring and content reporting/moderation before public launch. |
| Medium | Upload safety | File extension is selected from declared MIME type; a malicious file can misreport MIME. No malware scan, image re-encode, EXIF removal or lifecycle cleanup. | Partial: allowlist, random filename, size caps and `nosniff`. Add content sniffing/scanning, image reprocessing and retention cleanup. |
| Medium | Video performance | Reels/stories use local disk, direct file streaming and up to 100 MB reel uploads without transcoding, thumbnails, adaptive bitrate or CDN. | Open. Reduce mobile upload size, transcode asynchronously, store in object storage and deliver through CDN/HLS/DASH. |
| Medium | Migration rollback | Rolling tenant data back to the pre-tenant schema can discard enrollment/integration data or collide on globally unique IDs. | Migration down now refuses once a real tenant, enrollment or integration exists; after tenant use, recover by restoring the pre-migration backup rather than destructively rolling back. |
| Medium | Performance | Auth middleware now does one account/university lookup per protected API request for immediate revocation. Chat list queries per thread and feeds use fixed limits rather than cursor pagination. | Tenant correctness prioritized. Add query-count/load measurements, cursor pagination, cache carefully by tenant and consider short-lived revocation-aware claims. |
| Medium | Visibility/privacy | National and university scopes exist for selected domains; profile visibility, audience controls, reports, moderation queues and reels comments are incomplete. | Partial. Implement explicit profile consent and content lifecycle rules before enabling broad national reach. |
| Medium | Operations | Errors are sanitized and request IDs added, but no production structured logger, metrics, tracing or alerting is present. | Partial. Add structured redacted logs and operational dashboards; never log passwords, tokens, reset codes or uploaded content. |
| Low/Medium | Frontend state | Data fetching is mostly screen-local; server state can refetch redundantly and loading/error behavior varies. | Existing architecture retained. Dashboard now displays university context and search handles failures; remaining app-wide error/loading/accessibility review is open. |
| Low/Medium | Documentation drift | API/build plans describe expected features and may not exactly reflect current handlers. | Architecture and this audit updated. API contract still needs endpoint-by-endpoint reconciliation. |

## Area-by-area audit

### Frontend, navigation and state

Expo Router provides file-based screens and tab/drawer navigation. Shared auth, notification and theme state are contexts; most domain data remains screen-owned through API wrappers/hooks. Role-based homes exist. The student home now receives university/campus/department/programme identity, and community UI marks national, university, department and course audiences. University selection is explicit in login/signup. Registration no longer allows role self-selection.

Risks: auth tokens are held in SecureStore on native and localStorage on web; web XSS remains consequential. No central server-state cache exists, screen refresh/error patterns vary, and full device/screen-reader testing was not possible in this source pass. `frontend/eslint.config.js` was added to resolve configured aliases; focused lint passes on changed screens. Full baseline lint still needs a cleanup pass.

### Backend, APIs and database

Express routers delegate to domain services using Knex/PostgreSQL. Authenticated requests use database-resolved role/status/tenant values. Academic timetable/exam queries use active course enrollments for students. Notice/chamber visibility queries explicitly support national/university/department/course scope. Admin, lecturer, clubs, chat, career, projects, documents, reels and search services received tenant-aware checks. Applicant access and company verification were tightened.

Migration 0015 uses composite unique keys/foreign keys to prevent several classes of mismatched university references, and adds indexes for common reads. It also creates a `student_course_enrollments` table and `university_integrations` metadata. Residual: some related tables (such as generic likes/membership rows and project memberships) rely on service authorization rather than tenant-composite FKs; PostgreSQL row-level security is not configured. Audit all new endpoints against a real two-tenant dataset before launch.

### Authentication and university integration

Local iCollege credentials remain a supported path; signup creates a pending student account in a selected active university. Existing external university credentials are not accepted. OIDC/SAML/SIS/LMS are configuration metadata only and disabled by default. No credential is collected on behalf of a university. Institutions must approve supported protocols and claim-to-student matching before adapter work begins.

### Files, stories/reels and notifications

Raw public uploads were removed; document/media routes verify signed link expiry and then recheck resource audience/ownership. Story/reel lists enforce declared audience and are bounded. Reels still lack transcoding and comments; content reporting/moderation and deletion/retention lifecycle are not complete. Notifications are scoped to each recipient ID and generated through service functions, but national-content notification preferences and delivery queues need design.

### Test and migration status

`backend/test/security.test.js` covers tenant predicate SQL shape, media-link resource/user binding and tampering, document-link binding, and expiry. `npm test` passes (3 tests). Changed frontend files pass focused ESLint; changed backend/migration/seed files pass `node --check`. Migration 0015 was applied successfully to the configured local `icollege` database after correcting a PostgreSQL DDL binding issue; Knex now reports 15 completed migrations and no pending migrations. The additive testing fixture created two active test universities, two students sharing a student ID across those tenants, university admins, enrolled courses and distinct university-only notices; all 20 legacy users remain quarantined. Manual HTTP checks verified login disambiguation, personalized `/auth/me`, pending signup/approval/login, and that each tenant receives only its own notice. The database role cannot create a separate test database, so a repeatable automated endpoint integration suite in an isolated database remains unavailable.

HTTP smoke checks against the current app on port 4010 returned a healthy API response. Before fixtures were added, the active-university list was empty because only the legacy provisioning tenant existed; it now includes the two test universities. Port 4000 was already occupied and was left untouched. An initial migration attempt failed at a PostgreSQL `CHECK` constraint because value placeholders are not accepted in that DDL; Knex left 0015 pending, the migration was corrected, and the subsequent run succeeded.

The full Expo web export completed successfully (1,459 modules bundled). Full frontend lint currently reports 26 errors and 14 warnings in the wider existing app; changed authentication/dashboard/community/search files pass focused lint. These remaining lint findings are recorded as cleanup work and were not all modified because several concern unrelated existing hooks/components.

## Implemented work by requested phase

The user requested Phase Zero through Phase Thirty-Two. Status means repository implementation/evidence, not merely planning.

| Phase | Status | Work / remaining |
|---|---|---|
| 0 Project discovery | Complete | Repository, docs, frontend/backend/database/auth/API/storage inspection; `PROJECT_ARCHITECTURE.md`. |
| 1 Architecture document | Complete | Current-state technologies, flows, strengths and weaknesses documented. |
| 2 Shared multi-university architecture | Partial | Tenant schema and scoped services implemented; operational tenant onboarding and RLS remain. |
| 3 Student identity | Partial | Campus/department/programme/year and course enrollment schema/admin endpoint; SIS verification and reconciliation remain. |
| 4 Legitimate authentication | Partial | Safe local login and disabled integration metadata; actual approved OIDC/SAML adapter is institution-dependent. |
| 5 Backend isolation | Partial | Reviewed service queries scoped; complete live endpoint matrix/two-tenant tests still required. |
| 6 Personalized dashboard | Complete (foundation) | User API carries university organization labels and home displays institutional identity. |
| 7 Visibility levels | Partial | National/university/department/course for notices/chambers; not all product entities use all scopes. |
| 8 Dashboard UX | Partial | Personalized dashboard maintained; full visual/device review outstanding. |
| 9 National student social layer | Partial | National technology/business/sports chambers seeded and audience supported. |
| 10 Scoped communities | Partial | Backend visibility checks, membership and audience label; community creation/admin lifecycle remains limited. |
| 11 Posts/reactions/comments/permissions | Partial | Visibility/membership checks and like/comment authorization; moderation, reporting and pagination remain. |
| 12 Stories/reels | Partial | Visibility, scoped reads, expiring stories and signed media; comments/moderation remain. |
| 13 Short-video performance | Not complete | Bounded lists only; transcoding, CDN, adaptive bitrate and thumbnails require infrastructure. |
| 14 Student profiles | Partial | Existing profile/portfolio retained; complete academic identity and privacy controls remain. |
| 15 Search/discovery | Partial | Search query services are tenant/visibility aware; ranking and cursor pagination remain. |
| 16 Notifications | Partial | Recipient-scoped API, national activity hooks; preferences/queues/reliability remain. |
| 17 Admin roles | Partial | Student self-role removed, privileged routes constrained; one-time platform-admin bootstrap and platform-admin provisioning/activation of university admins are implemented. Institution verification and operational role policy remain. |
| 18 University integration layer | Partial | Per-tenant disabled integration metadata and secret references; protocol adapters are not implemented. |
| 19 Database optimization | Partial | Composite constraints and common access indexes added; no production EXPLAIN/load test or RLS. |
| 20 API audit | Partial | Reviewed route/service tenant checks and error responses; contract reconciliation and full endpoint tests remain. |
| 21 Cross-university security tests | Partial | Predicate/link tests pass and manual two-tenant notice/login isolation was verified; repeatable automated API integration suite still needs an isolated test database. |
| 22 Automated tests | Partial | Three backend security unit tests added; broad unit, integration, component and E2E suites remain. |
| 23 Mobile UX/UI | Partial | University picker, contextual dashboard and audience labels; full accessibility/device review remains. |
| 24 | Not specified | No Phase 24 was present in the request. |
| 25 Student product value | Partial | National career/community foundations exist; discovery/privacy/product research remains. |
| 26 Scalability | Partial | Query bounds/indexes added; load tests, horizontal media storage, queues and capacity plan remain. |
| 27 Errors/logging | Partial | Request IDs, security headers, sanitized errors; structured logger, redaction review, metrics remain. |
| 28 Data quality/validation | Partial | Tenant placement checks and bounded auth input; common request schemas and SIS data validation remain. |
| 29 Safe migrations | Partial | Additive tenant migration with quarantine and constraints; backup rehearsal, deploy/rollback rehearsal and production run remain. |
| 30 Full application tests | Not complete | No database-backed or device E2E environment was available; focused tests and static checks pass. |
| 31 Final security check | Partial | Source audit and focused security checks completed; independent penetration test and live integration audit remain. |
| 32 Final report | Complete | This report documents findings, work and explicit remaining items. |

## Required release gates

1. Restore a production-like database backup into an isolated environment; run migration 0015 and its rollback/recovery rehearsal there. Do not attribute legacy records until university ownership is verified.
2. Provision the first active tenant/platform admin with the one-time bootstrap command; provision institution administrators through the protected platform API. Require institution admins to verify student IDs/enrollment before student activation.
3. Run automated API tests with at least two universities and assertions for read, write, search, media, documents, chat, memberships and admin routes. Include national visibility as explicit positive control.
4. Configure real mail, secret manager, CORS origins, database TLS/backups, rate limits and production log redaction.
5. Define moderation, profile privacy, applicant disclosure, content retention/deletion and user reporting before broad national social/reel launch.
6. Decide and fund object storage/CDN/video processing, then load-test feed/search/chat/media and verify mobile accessibility on supported devices.
