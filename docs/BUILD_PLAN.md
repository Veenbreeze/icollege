# iCollege — Build Plan (gaps → tasks)

Derived from the Functional Requirements Specification (§ = spec section) and a
live audit of the app on 2026-09-11. Legend: **FE** = mobile frontend (`frontend/`),
**BE** = backend (`backend/`), **WEB** = web/desktop concern.

## Status snapshot
Done: auth, dashboard, timetable, exams, seating, notices (view), chambers/forum,
chat, clubs/events, iVault, iCareer (jobs/projects/portfolio), iAI assistant + search,
reels, role dashboards, RBAC, dark mode.

Roles today: Student ✅ · Lecturer ✅ · Club Admin ✅ · Employer 🟡 (no talent search)
· University/Platform Admin 🟡 (oversight only, cannot create academic data).

---

## 🔴 URGENT

### 1. Admin data-management (§23)
So admins can **create** the data students consume (currently only seeded).
Approach: build management screens inside the existing app (works on desktop web);
a dedicated Web Admin Portal can come later.
- **BE:** `POST/PATCH/DELETE` for notices, exams, timetable slots, courses, users. (Tables already exist; `POST /api/admin/notices` + courses endpoints already stubbed.)
- **FE:** Admin console → **Manage** tab: create Notice / Exam / Timetable slot (+ lists). *(Cycle 1, in progress.)*

### 2. Notifications + Rule Engine (§9/§26)  🟡 BACKEND DONE (2026-09-19), FE pending
- **BE:** ✅ `device_tokens` + `notifications` tables (migration 0014); `notificationService` (rule engine + best-effort Expo push); `/api/notifications` routes; hooks on admin/lecturer notice publish + lecture cancel/move. Verified end-to-end.
- **FE:** ⬜ register Expo push token on login; notifications feed screen + bell-icon unread badge; tap → deep-link.

### 3. Employer talent search / portfolio review (§17)  ✅ DONE (2026-09-13)
- **BE:** `GET /api/employer/talent-search?skill=&programme=` — already existed.
- **FE:** Employer console → **Find Student Talent** card (skill + programme search, results list). Built & verified.
- Follow-up (later): tapping a result → read-only portfolio detail.

## 🟠 HIGH

### 4. iLibrary + lecturer material upload (§16)  ✅ DONE (2026-09-14)
- **BE:** lecturer upload (`POST /api/lecturer/materials`) existed; **added** `GET /api/library` (browse). Uses `documents` table, visibility='course'.
- **FE:** Lecturer Console **Upload Course Material** card; student **iLibrary** screen; Library tile un-"Soon"'d. Verified end-to-end.
- Follow-up (later): full Faculty→Programme→Year→Semester hierarchy + scope to enrolled courses.

### 5. Content moderation + privacy (§24) — before public launch
- **BE:** `reports` table + report/moderation endpoints; profile privacy flags.
- **FE:** Report action on posts/comments/reels/users; admin **Moderation** queue; Settings → **Privacy** toggles.

## 🟢 GRADUAL
iCompete (§15) · full iCollege Social & Stories/rich-chat (§11–13) · real AI generation (§19) · gamification engine (§22) · iMarket/iStyle/iMusic (§21) · external integrations (§25) · timetable Month view · real biometric login.

---

## Suggested sequence
1. **Cycle 1 — Operability:** admin create Notices/Exams/Timetable (unblocks real data).
2. **Cycle 2 — The promise:** push notifications + rule engine; employer talent search.
3. **Cycle 3 — Learn:** iLibrary + material upload; remaining admin CRUD (seating, courses, users).
4. **Cycle 4 — Trust:** moderation + privacy (gate before any pilot launch).

See `API_CONTRACT.md` for the endpoint specs the frontend is being built against.
