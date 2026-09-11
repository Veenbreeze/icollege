# iCollege

> Your Campus. Your Community. Your Future.

iCollege is a student-centered digital ecosystem — a mobile app for campus life,
learning, community, careers and AI-assisted study. This is a monorepo with a
React Native (Expo) app and a Node.js + PostgreSQL API.

## Workspace structure

- `frontend/` — Expo SDK 57 React Native app (Expo Router, **JavaScript**). Talks to the API.
- `backend/` — Node.js / Express API backed by **PostgreSQL** (Knex migrations, JWT auth, role-based access control).
- `reqs/` — local requirements & UI references (git-ignored, not in the repo).

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally

## Backend setup

```bash
# 1. Create the database and role (one-time; adjust to taste)
psql -d postgres -c "CREATE ROLE icollege WITH LOGIN PASSWORD 'icollege' CREATEDB;"
psql -d postgres -c "CREATE DATABASE icollege OWNER icollege;"

# 2. Configure env
cp backend/.env.example backend/.env
#   then edit backend/.env — at minimum DATABASE_URL and the JWT_* secrets
#   default DATABASE_URL: postgres://icollege:icollege@localhost:5432/icollege

# 3. Install, migrate, seed
npm --prefix backend install
npm --prefix backend run migrate    # creates the schema (13 migrations)
npm --prefix backend run seed       # loads demo data

# 4. Run the API (http://localhost:4000)
npm run backend
```

Health check: `GET http://localhost:4000/api/health` → `{ "status": "ok" }`

### Demo login accounts (from the seed)

All use password `Password123!` unless noted:

| Role | student_id |
|------|------------|
| Student | `ICU/2024/00458` |
| Lecturer | `STAFF/00019` |
| University admin | `ADMIN/UNI01` |
| Platform admin | `PLATFORM/ADMIN01` |
| Employer | `EMP/ZURI01` |
| Club admin | `CLUB/INNOV01` |

## Frontend setup

```bash
cp frontend/.env.example frontend/.env    # EXPO_PUBLIC_API_URL=http://localhost:4000
npm --prefix frontend install
npm run frontend                          # then press a / i / w, or scan the QR in Expo Go
```

The app reads the API base URL from `EXPO_PUBLIC_API_URL`. On a physical device,
set it to your computer's LAN IP (e.g. `http://192.168.x.x:4000`) instead of
`localhost` so the phone can reach the API.

## Mobile app

Screens: home dashboard, timetable, exams & seating, notices, iVault documents,
chambers/community + forum posts, live chat, clubs & events, reels & stories,
iCareer (opportunities, projects, portfolio), the iAI assistant (chat, study
tools, smart search), plus auth, settings, help, edit-profile, content-creation,
and role dashboards (admin / lecturer / employer / club admin). Includes light &
dark themes. Data comes from the API; `frontend/src/data/mock.js` holds only
small fallback constants.

## Scripts (repo root)

- `npm run frontend` — start the Expo app
- `npm run backend` — start the API in watch mode
