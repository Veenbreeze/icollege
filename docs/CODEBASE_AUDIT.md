# iCollege — Codebase Audit (Phase Zero)

_Direct inspection of frontend, backend, DB, auth, APIs, navigation, state, and file
storage on 2026-09-21. Severity reflects risk **for the stated goal of a secure,
multi-university platform**, not just the current single-tenant demo._

Severity key: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

## 🔴 Critical

### C1 — No multi-tenant (university) model exists
- **Evidence:** `users` has no `university_id`/`campus_id`/`department_id`; only free-text
  `programme`, `year`. `platform_settings` stores a single `institution_name`
  ("iCollege University"). No `universities`/`campuses`/`departments` tables.
- **Impact:** Every student, notice, timetable slot, course, chamber, post, reel and
  profile is **global**. The moment a second university is onboarded, **all data is
  shared across institutions** — the exact cross-university leakage you want to prevent.
  Multi-university isolation is not "weak" today; it is **structurally impossible**.
- **Fix (foundation for most later phases):** add `universities` (+ `campuses`,
  `departments`, `programmes` as needed), a nullable→backfilled→NOT NULL `university_id`
  on every tenant-owned table, and a `visibility_scope` where content spans levels
  (national/university/department/course).

### C2 — Backend performs no tenant/data scoping on reads
- **Evidence:** `academicService.getNotices` / `getTodayTimetable`, `communityService.listChambers`
  / `listPosts`, `reelsService.listReels`, `employerService.searchTalent` all return rows
  with no ownership/tenant filter (they use `userId` only for read-state, not row filtering).
- **Impact:** Any authenticated user can read all institutions' data. Isolation cannot be
  delegated to the frontend (the API returns everything regardless of client).
- **Fix:** derive `university_id` (and role scope) from the **JWT**, and filter **every**
  tenant-owned query server-side. Add a scoping helper so it can't be forgotten.

### C3 — `/uploads` is served statically with no authentication
- **Evidence:** `app.use('/uploads', express.static(path.resolve(env.uploadDir)))`. Files
  live at `uploads/<subfolder>/<userId>/<uuid.ext>`.
- **Impact:** Any private iVault document, avatar, reel or course material is **world-
  readable by URL** — no login, no ownership check, no tenant check. UUID names slow but
  don't stop enumeration/leaked-link access.
- **Fix:** serve downloads through an authenticated route that checks ownership/visibility
  (and, later, tenant), or use signed, expiring URLs. At minimum gate `/uploads` behind auth.

### C4 — JWT carries no tenant claim
- **Evidence:** `signAccessToken` → `{ sub, studentId, role }`; `requireAuth` sets
  `req.user = { id, studentId, role }`.
- **Impact:** Even after adding a tenant model, the backend has no trusted `university_id`
  to scope by without an extra DB lookup per request. Scoping decisions would be unanchored.
- **Fix:** include `universityId` (and campus/department as needed) in the access token and
  in `req.user`; treat it as the authority for all scoping.

---

## 🟠 High

### H1 — No rate limiting on auth (or anywhere)
- **Evidence:** deps are `bcryptjs, cors, dotenv, express, jsonwebtoken, knex, multer,
  nodemailer, pg, uuid` — no `express-rate-limit`. `/api/auth/login`, `/refresh`,
  `/forgot-password`, `/reset-password` are unthrottled.
- **Impact:** Brute-force / credential-stuffing / reset-code guessing are unconstrained.
- **Fix:** per-IP + per-account rate limits on auth endpoints; lockout/backoff on repeated failures.

### H2 — Wide-open CORS + no security headers
- **Evidence:** `app.use(cors())` (all origins). No `helmet`.
- **Impact:** Any origin can call the API with a bearer token; missing hardening headers.
- **Fix:** allow-list origins; add `helmet`; set sensible CORS per environment.

### H3 — `student_id` is the global login key and globally unique
- **Evidence:** `login`/`signup` look up `users.student_id` with no tenant qualifier;
  unique across the whole table.
- **Impact:** Two universities cannot both have a student "2024/001". Also lets one
  university's ID space clash with another's during onboarding.
- **Fix:** make identity `(university_id, student_id)` unique; select tenant at login
  (subdomain/university picker) so lookups are scoped.

### H4 — Self-service signup with no verification or tenant binding
- **Evidence:** `signup` creates students `active` immediately; `role` is client-supplied
  (non-students go `pending`), but there is no email/domain/university verification and no
  university is attached.
- **Impact:** Anyone can create a "student" of the (only) institution; in multi-tenant this
  becomes "anyone can join any university." Approval for privileged roles is a single global
  admin, not the right university's admin.
- **Fix:** bind signup to a university (verified email domain or admin invite); route
  approvals to that university's admins.

### H5 — Course-material visibility relies on the URL staying secret
- **Evidence:** `documents.visibility='course'` is enforced when *listing* via `/api/library`,
  but the file itself is fetched from unauthenticated `/uploads` (see C3).
- **Impact:** "course-only" and "private" are not actually enforced at the file layer.
- **Fix:** same as C3 (authenticated, ownership/visibility-checked downloads).

---

## 🟡 Medium

### M1 — No pagination on feeds
- **Evidence:** `listChambers`, `listPosts`, `listReels`, notices, timetable return full
  tables/joins; only notification services `.limit(50)`.
- **Impact:** Payloads and query cost grow unbounded with data; slow app, heavy DB.
- **Fix:** cursor/keyset pagination on all list endpoints.

### M2 — Two overlapping notification systems
- **Evidence:** social `notifications` + `academic_notifications` (post-merge), separate
  routes/services/feeds; academic has no frontend consumer.
- **Impact:** Duplicated concepts, split unread counts, confusing UX.
- **Fix:** unify into one feed with a normalized shape + source discriminator, or clearly
  separate "Activity" vs "Alerts" with one bell aggregating both.

### M3 — No input validation layer
- **Evidence:** routes hand `req.body` straight to services with ad-hoc `if (!x)` checks;
  no schema validation (zod/joi).
- **Impact:** Inconsistent 400s, potential bad data, more edge-case bugs.
- **Fix:** a validation middleware with per-route schemas.

### M4 — No structured logging / observability
- **Evidence:** no `morgan`/`pino`/`winston`; errors `console.error` only.
- **Impact:** Hard to debug prod, no audit trail of requests, no correlation IDs.
- **Fix:** structured request logging + error reporting; keep `audit_logs` for privileged actions.

### M5 — No shared server-state cache on the client
- **Evidence:** `useApi` fetches per screen mount; no React Query/SWR.
- **Impact:** Redundant network calls, no cache invalidation story, more spinners.
- **Fix:** adopt a query cache for shared data.

## 🟢 Low
- **L1** `platform_settings` singleton assumes one institution (folds into C1).
- **L2** Free-text `programme`/`year` on `users` should become FKs to real tables.
- **L3** Mixed id conventions (`mat-`, `doc-`, raw ints) across domains.
- **L4** Some N+1-style `Promise.all(map(...))` patterns (e.g. mark-all-read) — fine now, watch at scale.

---

## Cross-university leakage — bottom line
The app is not "leaking across universities" today only because **there is exactly one
university**. There is **no isolation mechanism to leak *through*** — so C1–C4 must be built
before any second institution touches the system. Every isolation guarantee has to be
enforced **server-side** (C2), anchored on a **tenant claim in the JWT** (C4).

## Recommended execution order (maps to your phases)
1. **Foundation (Phases 2–5):** tenant model (C1) → identity linkage (Phase 3) → tenant JWT
   claim (C4) → backend scoping everywhere (C2) → authenticated file access (C3/H5).
2. **Hardening (Phases 20/21/27/31):** rate limiting (H1), CORS+helmet (H2), validation (M3),
   logging (M4), and **automated cross-tenant leak tests** (Phase 21) to prove isolation.
3. **Product (Phases 6–16, 8, 23):** personalization, visibility levels, social layer,
   scoped chambers, posts/reactions, stories/reels, profiles, search, unified notifications.
4. **Scale/quality (Phases 19/22/26/28/29):** DB indexes + pagination (M1), tests, migrations.

Each foundation step needs a **migration plan** (Phase 29) and a **leak test** (Phase 21)
before it's considered done.
