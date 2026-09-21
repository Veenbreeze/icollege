# Multi-Tenant Foundation (Phases 2–5)

_Status as of 2026-09-21. Addresses audit findings C1, C2 (academics), C4._

## Model
```
universities (id, name, slug, short_name, email_domains[], country, color_key, logo_url)
  └─ campuses (university_id, name, location)
  └─ departments (university_id, name, code)
       └─ programmes (university_id, department_id, name, code, duration_years)

users.university_id / campus_id / department_id / programme_id   (nullable, backfilled)
courses.university_id / department_id
notices.university_id + scope (national|university|department|course) + department_id / course_id
```
Migration `0016_multi_tenant.js` adds these **nullable** and backfills every existing
row to a default **iCollege University** (id 1), so nothing broke.

## The isolation contract
1. The access **JWT** carries `universityId` (`signAccessToken`), surfaced as
   `req.user.universityId` by `requireAuth`. This is the **trusted tenant anchor** —
   never trust a university id from the request body/query.
2. Every tenant-owned **read** filters by `req.user.universityId` **server-side**.
   Frontend filtering is never relied upon.
3. Every tenant-owned **write** stamps `university_id` from `req.user.universityId`
   (or the actor's row for lecturers).
4. `scope='national'` content (e.g. platform-wide notices) is visible across
   universities by design — the one intentional exception.

## Done + proven
- ✅ Reads scoped: `getNotices`, `getTodayTimetable`, `getWeekTimetable`, `getExams`.
- ✅ Writes stamped: admin `createNotice`, lecturer `createNotice`; notification
  audience (`activeStudentIds`) scoped by university; lecture-cancel alerts scoped.
- ✅ `/api/auth/me` enriched with `universityName` / `universityShortName` (for Phase 6).
- ✅ **Automated leak test**: `backend/scripts/tenant-leak-test.mjs` (Phase 21) — logs in
  as an ICU and a UIT student and asserts neither sees the other's academics. Passing.

## Remaining scoping (next steps, tracked)
- ✅ **Courses / exam-seating / iLibrary / AI study courses** — reads scoped by university
  (2026-09-21). Admin course list scoped (platform_admin sees all). New courses stamped.
- ✅ **C3 authenticated file access** — sensitive files (iVault `documents/` + course
  `materials/`) are no longer served statically; `GET /api/files/:id/download` (requireAuth)
  checks visibility: `private`→owner-only, `course`→same-university. Public media
  (avatars/posts/reels/stories) still static. Verified: 401 no-auth, 200 owner/same-uni,
  403 other-uni/non-owner, 404 old static path. Leak test extended to cover these.
- ⬜ **Talent search** — decide: national (employers hire cross-university, current) vs
  scoped. Currently returns all open students; confirm intended visibility.
- ⬜ **Chambers / posts / reels / stories** — add `scope` (national vs university) for the
  social-layer phases (9/10); national is the default social experience.
- ⬜ **H3 login identity** — make `(university_id, student_id)` the unique key and select
  university at login, so IDs can repeat across universities.
- ⬜ **H4 signup binding** — bind signup to a university via verified email domain
  (`universities.email_domains`) or admin invite/bulk import; route role approvals to that
  university's admins.
- ⬜ **Admin consoles** — `university_admin` scoped to their university; `platform_admin` global.
- ⬜ Enforce `NOT NULL` on `university_id` once all write paths stamp it.

## Local setup for the leak test
The test needs a second university. One-time:
```sql
INSERT INTO universities (name, slug, short_name, email_domains, country, color_key)
VALUES ('Uhuru Institute of Technology','uhuru-institute','UIT','{uit.ac.tz}','Tanzania','blue');
-- + a UIT student, course, timetable slot, exam, notice (see git history / seed).
```
Then: `node backend/scripts/tenant-leak-test.mjs`
