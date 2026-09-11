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

### 2. Notifications + Rule Engine (§9/§26)
- **BE:** `device_tokens` table + register endpoint; `sendPush()` via Expo Push API; rule engine (lecture cancel/postpone, notice publish → notify affected students → push).
- **FE:** register Expo push token on login; handle tap → deep-link.

### 3. Employer talent search / portfolio review (§17)
- **BE:** `GET /api/employer/talent?skills=&programme=&year=` (respect privacy) + `GET /api/employer/talent/:id`.
- **FE:** Employer console → **Find Talent** (filters + results → read-only portfolio).

## 🟠 HIGH

### 4. iLibrary + lecturer material upload (§16)
- **BE:** `library_materials` table (University→Faculty→Programme→Year→Semester→Course); upload + browse/download endpoints.
- **FE:** lecturer/admin **Upload Material**; student **iLibrary** browse screen (replaces the "Soon" tile).

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
