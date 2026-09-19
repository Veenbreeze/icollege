# iCollege — API Contract (for backend)

Endpoints the frontend is being built against. All require
`Authorization: Bearer <accessToken>` and (except where noted) the caller's role
must be `university_admin` or `platform_admin`. Column names reference the
existing Knex migrations.

---

## Cycle 1 — Admin data-management  🔴
> ✅ **Already implemented on the backend** (`backend/src/routes/admin.js` +
> `adminService.js`) and verified. The frontend Manage screens call these directly.
> Documented here for reference / future cycles.

### Notices  — `notices` table
Already stubbed on the client as `createNotice`.
```
POST /api/admin/notices
body: {
  title: string,           # required
  body: string,            # required
  category: string,        # required  e.g. "Exams" | "Academic" | "Timetable" | "Events" | "Career"
  priority: string         # "Critical" | "Important" | "Normal"  (default "Normal")
}
→ 201 { id, title, body, category, priority, publishedAt }
```
(When notifications land in Cycle 2, publishing a notice should also fan out push alerts.)

### Courses  — `courses` table  (needed to populate the pickers below)
`fetchCourses` / `createCourse` already exist on the client.
```
GET  /api/admin/courses            → 200 [{ id, code, title, lecturerName }]
POST /api/admin/courses
body: { code: string, title: string, lecturerName?: string }
→ 201 { id, code, title, lecturerName }
```

### Exams  — `exams` table
```
POST /api/admin/exams
body: {
  courseId: number,        # required (references courses.id)
  type: string,            # "Final" | "Mid-Semester" | "CAT / Test" | "Supplementary"
  examDate: string,        # ISO date "YYYY-MM-DD"
  examTime: string,        # e.g. "09:00 AM"
  duration?: string,       # e.g. "2h"
  venue?: string,
  room?: string
}
→ 201 { id, courseId, type, examDate, examTime, duration, venue, room }
```

### Timetable slots  — `timetable_slots` table
```
POST /api/admin/timetable-slots
body: {
  courseId: number,        # required
  dayOfWeek: number,       # 0=Sun … 6=Sat
  startTime: string,       # "08:00"
  endTime: string,         # "10:00"
  room?: string,
  type?: string            # default "Lecture"
}
→ 201 { id, courseId, dayOfWeek, startTime, endTime, room, type }
```

> Response keys are **camelCase** to match the rest of the API (the DB is
> snake_case; map in the service layer as the existing endpoints do).

---

## Cycle 2 — Notifications + Employer talent

### Employer talent search  ✅ DONE (backend + frontend, verified 2026-09-13)
Backend `GET /api/employer/talent-search?skill=&programme=` already exists
(`employerService.searchTalent`), returns students with `open_to_opportunities=true`:
`[{ id, full_name, programme, year, headline, location }]`. The employer console
"Find Student Talent" card calls it. **No backend work needed.**

### Push notifications + rule engine  ✅ BACKEND DONE (built + verified 2026-09-19)
Built: migration `0014_notifications.js` (`device_tokens`, `notifications` tables),
`services/notificationService.js` (rule engine + best-effort Expo push),
`routes/notifications.js` (mounted at `/notifications`). Rule-engine hooks added to
`adminService.createNotice`, `lecturerService.createNotice`, and
`lecturerService.createLectureUpdate` (on cancelled/moved). Verified end-to-end:
notice publish + lecture cancel → per-student in-app notifications; mark-read + counts work.
```
POST  /api/notifications/register-token   body: { token, platform }  → 204  (upsert)
GET   /api/notifications                  → [{ id, title, body, type, read, deepLink, createdAt }]
GET   /api/notifications/unread-count     → { count }
PATCH /api/notifications/:id/read         → the updated notification
POST  /api/notifications/read-all         → 204
```
Rule engine (no endpoint — hooks existing writes): admin/lecturer notice publish →
notify all active students (type 'notice', deepLink '/notices'); lecture
cancelled/moved → notify students (type 'lecture', deepLink '/timetable'). Each
event inserts per-student `notifications` rows, then fires a best-effort Expo push
(https://exp.host/--/api/v2/push/send) to any registered `ExponentPushToken`s —
push failures never break the triggering action. Audience = all active students
(no per-student enrollment yet; narrow once enrollment exists).

**FRONTEND ✅ DONE (in-app, 2026-09-19):** notifications feed screen (`app/notifications.jsx`)
+ client (`lib/api/notifications.js`); home bell icon now opens `/notifications` with a
live unread badge (`GET /unread-count`); tap a notification → mark read + deep-link.
**Remaining (needs a native device build):** install `expo-notifications`, obtain the
Expo push token on login, call `POST /register-token`. On web there is no OS push token,
so this is a device-only follow-up; the endpoint + `registerPushToken()` client are ready.
(SMS/email delivery = later, optional.)

## Cycle 3 — iLibrary

### Lecturer upload  ✅ DONE (backend existed, frontend built 2026-09-13)
`POST /api/lecturer/materials` (multipart: `file` + `courseId`) already exists —
stores into `documents` with `visibility='course'`, `course_id` set. The Lecturer
Console "Upload Course Material" card calls it. **No backend work needed.**

### Student browse  ✅ DONE (built + verified end-to-end 2026-09-14)
`GET /api/library` now exists (`routes/library.js` + `services/libraryService.js`,
mounted in `routes/index.js`). Verified: lecturer upload → appears in student
iLibrary grouped by course. Response shape below.
```
GET /api/library[?courseId=]
  # Returns course materials (documents where visibility='course') that the
  # requesting student can see — join documents→courses for the code/title.
  → [{
      id,
      name,                # documents.name (original filename)
      type,                # documents.doc_type: "pdf" | "image" | "doc"
      size,                # human string e.g. "284 KB" (from size_bytes)
      url,                 # public url for storage_path (publicUrlFor)
      courseCode,          # courses.code
      courseTitle,         # courses.title
      uploadedBy,          # lecturer full_name
      createdAt
    }]
```
Optional later: scope to the student's enrolled courses once enrollment exists;
a `GET /api/library/:id/download` for auth'd streaming.

## Cycle 4 — Moderation + Privacy  🟠
```
POST  /api/reports                 body: { targetType: "post"|"comment"|"reel"|"user", targetId, reason }
GET   /api/admin/reports?status=open
PATCH /api/admin/reports/:id       body: { action: "dismiss"|"remove"|"warn"|"suspend", note? }
PATCH /api/auth/me/privacy         body: { profileVisibility: "public"|"university"|"private", portfolioVisible: boolean }
```
