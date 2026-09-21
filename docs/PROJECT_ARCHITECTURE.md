# iCollege — Project Architecture (Phase Zero: Discovery)

_Grounded in a direct inspection of the codebase and live database on 2026-09-21.
This describes the system **as it actually is today**, not as planned._

---

## 1. What it is
iCollege is a student-centred university **mobile app** (with a web build used for
testing). Students get a dashboard, timetable, exams + seating, notices, an iVault
document store, an iLibrary of course materials, community "Chambers" (forums),
chat, clubs/events, reels/stories, an iCareer job/portfolio area, and an AI helper.
There are role consoles for **lecturers**, **university/platform admins**, **employers**,
and **club admins**.

## 2. Tech stack
| Layer | Technology |
|-------|-----------|
| Mobile/Web frontend | Expo SDK 57, React Native 0.86, **expo-router**, JavaScript (no TypeScript) |
| Styling/theme | Custom `themedStyles((colors)=>…)` proxy, light/dark theme-aware |
| Backend | Node.js + **Express**, ES modules |
| DB access | **Knex** query builder (no ORM) |
| Database | **PostgreSQL** |
| Auth | JWT access tokens + rotating refresh tokens, **bcryptjs** hashing |
| File uploads | **multer** → local disk under `uploads/` |
| Email | nodemailer (optional; dev falls back to returning codes) |
| Media | expo-video (reels/stories), expo-image-picker, expo-document-picker |

Monorepo: `frontend/` (Expo app) + `backend/` (Express API) + `docs/`.

## 3. Main components
**Backend** (`backend/src`)
- `app.js` — Express app: `cors()`, `express.json()`, static `/uploads`, `/api` router, error handler.
- `routes/` — one router per domain, aggregated in `routes/index.js` and mounted under `/api`.
- `services/` — business logic + all DB access via Knex.
- `middleware/` — `auth.js` (JWT verify), `roles.js` (RBAC), `upload.js` (multer), `errorHandler.js`.
- `db/` — Knex migrations (`0001`–`0015`) and a demo seed.

**Frontend** (`frontend/src`)
- `app/` — expo-router file-based screens; `_layout.jsx` declares the stack + global providers.
- `lib/api/` — typed-ish API clients built on `apiFetch` (auto token refresh).
- `lib/auth/` — `AuthContext` (session state) + `session.js` (SecureStore/localStorage).
- `lib/notifications/` — `NotificationsContext` (15s polling) + toast.
- `hooks/` — `useApi(fetcher)`, `usePolling`.
- `theme/`, `components/`, `config/navigation.js`.

## 4. Authentication flow
1. **Login** `POST /api/auth/login {studentId, password}` → looks up `users.student_id`,
   `bcrypt.compare`, blocks `pending`/`suspended`, then `issueSession`.
2. **issueSession** signs an **access JWT** (`{ sub, studentId, role }`) and creates a
   **refresh token** (random, stored **hashed** in `refresh_tokens`).
3. Frontend stores both in SecureStore (native) / localStorage (web) via `session.js`.
4. `apiFetch` attaches `Authorization: Bearer <access>`. On 401 it calls
   `/api/auth/refresh` once (single-flight), rotates the refresh token, retries.
5. **Middleware** `requireAuth` verifies the access token and sets
   `req.user = { id, studentId, role }`. `requireRole(...roles)` gates admin/role routes.
6. **Signup**: students → created `active` immediately (no verification). Other roles →
   `pending` until an admin approves. Password reset uses a hashed one-time code.

## 5. Database flow / data model
~50 tables. Core clusters:
- **Identity**: `users` (student_id, password_hash, role, status, programme, year, …),
  `profiles`, `refresh_tokens`, `password_reset_tokens`, portfolio tables
  (`user_skills`, `user_education`, `user_experience`, `user_certifications`).
- **Academic**: `courses`, `timetable_slots`, `lecture_updates`, `exams`, `exam_seats`,
  `notices`, `notice_reads`, `documents` (iVault + iLibrary via `visibility`).
- **Community**: `chambers`, `chamber_members`, `posts`, `comments`, `likes`, `reels`,
  `stories`, `story_views`; `clubs`, `events`, `competitions`.
- **Chat**: `chat_threads`, `chat_thread_members`, `chat_messages`.
- **Career**: `companies`, `opportunities`, applications/saves, `projects`.
- **Platform**: `platform_settings` (single `institution_name`), `audit_logs`.
- **Notifications** (two parallel systems after a recent merge):
  `notifications` (social: like/comment/…), `academic_notifications` (notice/lecture),
  `device_tokens`.

Services read/write these directly with Knex; there is **no per-tenant scoping column**
anywhere (see audit).

## 6. API flow
- All domains mounted under `/api` in `routes/index.js`.
- Reads generally take the caller's `userId` only to compute *their* read-state
  (e.g. `notice_reads`), **not** to filter which rows they may see.
- Responses are mapped to camelCase in services (e.g. `toPublicUser`).
- File URLs are returned as server-relative paths; the client turns them absolute via
  `resolveMediaUrl`.

## 7. File storage
- multer stores uploads on local disk: `uploads/<subfolder>/<userId>/<uuid.ext>`.
- Served by `app.use('/uploads', express.static(...))` — **static, unauthenticated**.
- DB rows keep the relative `storage_path`; `publicUrlFor` builds the `/uploads/...` URL.

## 8. State management (frontend)
- **Server state**: `useApi(fetcher)` (fetch-on-mount) + `NotificationsContext` (polling).
  No React Query/SWR cache — each screen fetches independently.
- **Auth/session**: `AuthContext` holds the current `user`; `session.js` persists tokens.
- **Theme**: `ThemeProvider` + a live `colors` proxy.

## 9. Navigation
- expo-router, file-based. `app/_layout.jsx` wraps everything in
  `GestureHandlerRootView → SafeAreaProvider → ThemeProvider → AuthProvider →
  NotificationsProvider → RootNavigator`, with an `AuthGate` redirecting between the
  auth stack and the app shell by session state. Roles route to their console via
  `RoleHome`.

## 10. Strengths
- Clean domain separation (routes ↔ services), consistent Knex usage.
- Solid auth primitives: bcrypt, **hashed** refresh tokens with rotation + revocation,
  hashed reset codes, login-enumeration-safe forgot-password.
- Real RBAC via `requireRole`; non-student signups require approval.
- Coherent, theme-aware design system; sensible client with single-flight refresh.
- Migrations are ordered and reversible; a rich seed makes the app demoable.

## 11. Weaknesses (headlines — full detail in `CODEBASE_AUDIT.md`)
- **No multi-university/tenant model at all.** One implicit institution; `users` has no
  `university_id`/`campus_id`/`department_id`. Cross-university isolation is currently
  *impossible* because there is only one tenant. This is the central architectural gap.
- **Data scoping is absent on the backend** — reads return global rows; any isolation
  would today rely on the frontend not asking. 
- **`/uploads` is unauthenticated** — private iVault documents and course materials are
  world-readable by URL.
- **Wide-open CORS**, no rate limiting, no security headers (`helmet`), no structured
  request logging.
- `student_id` is globally unique (collides across universities); JWT carries no tenant.
- No pagination on feeds; no shared server-state cache; two overlapping notification
  systems post-merge.

---
_Next: `CODEBASE_AUDIT.md` (severity-classified findings) → then the multi-tenant
foundation, which most later phases depend on._
