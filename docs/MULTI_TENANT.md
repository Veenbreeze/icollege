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
- ✅ **Chambers / posts / reels** — `scope` added (migration `0017`): `national` (cross-
  university social layer) vs `university` (visible only within one university). Existing
  chambers backfilled to national. Reads scoped: `listChambers` (national + own-university),
  `getChamber`/`listPosts` (404 for outsiders), `listReels` (national/no-chamber + own-
  university). Verified by 4 new leak-test checks. TODO: block *posting* to a university
  chamber you can't see (createPost visibility check); scope `stories` (currently national).
- ✅ **H3 login identity** (migration `0018`) — `(university_id, student_id)` is now the
  unique key (global `student_id` unique dropped), so IDs can repeat across universities.
  `login(studentId, password, universitySlug?)` disambiguates when several universities
  share an ID (else works as before). Proven: same ID registered under ICU and UIT.
- ✅ **H4 signup binding** — signup resolves the university from the verified email domain
  (`resolveUniversityByEmail` → `universities.email_domains`) and binds `university_id`;
  unknown domains are rejected. Employers stay cross-university (no binding). Public
  `GET /api/auth/universities` feeds login/signup pickers. Frontend signup already
  collects email, so it works unchanged. FOLLOW-UP: a university picker on the login
  screen (only needed once IDs actually collide across universities); admin invite / bulk
  import path; route role-approvals to the right university's admins.
- ✅ **Admin consoles** — `university_admin` scoped to their university; `platform_admin`
  global. Scoped: `listUsers` (roster), `updateUserStatus` (approvals guard), `getStats`
  (user counts), `listTimetableChangeRequests` + resolve guard, `updateNotice`/`deleteNotice`,
  `updateCourse`/`deleteCourse`. Fixed bug: `generateExamSeating` seated ALL students
  platform-wide → now scoped to the exam's university. Migration `0019` un-scopes
  `platform_admin` + `employer` (`university_id = NULL`) so they act globally. Verified:
  ICU admin sees only ICU users, can't suspend a UIT student (400); platform admin sees all.
  FOLLOW-UP: guard `updateExam`/`deleteExam` + `updateTimetableSlot`/`deleteTimetableSlot`
  (derive university via course) — lower risk, not yet done.
- ⬜ Enforce `NOT NULL` on `university_id` once all write paths stamp it.

## Local setup for the leak test
The test needs a second university. One-time:
```sql
INSERT INTO universities (name, slug, short_name, email_domains, country, color_key)
VALUES ('Uhuru Institute of Technology','uhuru-institute','UIT','{uit.ac.tz}','Tanzania','blue');
-- + a UIT student, course, timetable slot, exam, notice (see git history / seed).
-- Social-layer fixture: an ICU-only chamber with a post + reel:
INSERT INTO chambers (slug,name,tagline,description,theme_key,emoji,scope,university_id)
VALUES ('icu-cs-dept','ICU CS Department','Internal ICU CS','ICU CS only','tech','💻','university',1);
-- + a post ('ICU-ONLY POST') and reel ('ICU-ONLY REEL') in that chamber.
```
Then: `API_URL=http://localhost:4001 node backend/scripts/tenant-leak-test.mjs`
(covers 18 checks: academic reads + social chamber/reel scope).
