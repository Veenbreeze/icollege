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

## Cycle 2 — Notifications + Employer talent  🔴 (spec next)

```
POST /api/notifications/register-token   body: { token: string, platform: "ios"|"android"|"web" }
# Rule engine (server-side): on lecture cancel/postpone & notice publish →
# create per-student notifications and send Expo push to their registered tokens.

GET  /api/employer/talent?skills=react,node&programme=&year=   → [{ id, fullName, programme, year, skills[], successScore, avatarUrl }]
GET  /api/employer/talent/:id                                  → full public portfolio (respect privacy flags)
```

## Cycle 3 — iLibrary  🟠
```
GET  /api/library?faculty=&programme=&year=&semester=&courseId=   → [{ id, title, type, courseCode, url, uploadedBy, createdAt }]
POST /api/library         (lecturer/admin, multipart)  fields: courseId, title, type + file "material"
GET  /api/library/:id/download
```

## Cycle 4 — Moderation + Privacy  🟠
```
POST  /api/reports                 body: { targetType: "post"|"comment"|"reel"|"user", targetId, reason }
GET   /api/admin/reports?status=open
PATCH /api/admin/reports/:id       body: { action: "dismiss"|"remove"|"warn"|"suspend", note? }
PATCH /api/auth/me/privacy         body: { profileVisibility: "public"|"university"|"private", portfolioVisible: boolean }
```
