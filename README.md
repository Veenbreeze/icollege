# iCollege

> Your Campus. Your Community. Your Future.

iCollege is a student-centered digital ecosystem â€” a mobile app for campus life,
learning, community, careers and AI-assisted study. This is a monorepo with a
React Native (Expo) app and a Node.js + PostgreSQL API.

## Workspace structure

- `frontend/` â€” Expo SDK 57 React Native app (Expo Router, **JavaScript**). Talks to the API.
- `backend/` â€” Node.js / Express API backed by **PostgreSQL** (Knex migrations, JWT auth, role-based access control).
- `reqs/` â€” local requirements & UI references (git-ignored, not in the repo).

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
#   then edit backend/.env â€” at minimum DATABASE_URL and the JWT_* secrets
#   default DATABASE_URL: postgres://icollege:icollege@localhost:5432/icollege

# 3. Install, migrate, seed
npm --prefix backend install
npm --prefix backend run migrate    # creates the schema (15 migrations)
npm --prefix backend run seed       # loads demo data

# 4. Run the API (http://localhost:4000)
npm run backend
```

Health check: `GET http://localhost:4000/api/health` â†’ `{ "status": "ok" }`

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

### Multi-university data and production migration

The latest migration adds university-scoped identities and data. Existing records are assigned to a `legacy-unassigned` university in `provisioning` status and cannot sign in until an operator verifies the institution mapping. Do not activate or relabel this tenant until its records are confirmed to belong to one institution; mixed legacy data must be reconciled by an authorized data owner. Back up and rehearse migration/rollback on a restored database before production. The demo seed assigns demo accounts to active ICU/ARU tenants.

For a new deployment without an existing platform admin, set `BOOTSTRAP_UNIVERSITY_SLUG`, `BOOTSTRAP_UNIVERSITY_NAME`, `BOOTSTRAP_ADMIN_STUDENT_ID`, `BOOTSTRAP_ADMIN_FULL_NAME`, `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` (12+ characters) in the one-time process environment, then run `npm --prefix backend run bootstrap:platform-admin`. The command refuses to run if an active platform admin exists, creates an active initial university only when absent, and stores only a bcrypt hash. Clear those environment values after it exits; never put the bootstrap password in source control or logs. Platform admins can provision institution admins through the protected `/api/admin/universities/:id/admins` route; institution admins set their password through the email reset flow before activation.

University login currently means iCollege-managed credentials. OIDC/SAML/SIS/LMS integration records are configuration metadata only and disabled; no university password is collected. Use `npm --prefix backend test` for the focused backend security tests. Database-backed tenant integration tests require an isolated PostgreSQL test database.

For local login/signup checks after migrations, run `npm --prefix backend run seed:testing`. This additive fixture creates `icu-test` and `aru-test`, one student, one university admin, one enrolled test course and university-scoped notice per tenant. It does not clear or modify `legacy-unassigned` or run the destructive full demo seed. It refuses to run when `NODE_ENV=production`.

| Test account | University | Password |
|---|---|---|
| `TEST/SHARED/0001` (student) | iCollege Test University (`icu-test`) | `Testing123!` |
| `ADMIN/TEST` (university admin) | iCollege Test University (`icu-test`) | `Testing123!` |
| `TEST/SHARED/0001` (student) | Ardhi Test University (`aru-test`) | `Testing456!` |
| `ADMIN/TEST` (university admin) | Ardhi Test University (`aru-test`) | `Testing456!` |

The same IDs exist in both fixture universities. Login uses the ID and password together to identify the account without a university picker; fixture passwords differ so either account can be tested. Sign up with a new student ID; the account starts pending. Sign in as that university's `ADMIN/TEST` account and approve it under Admin Ã¢â€ â€™ Users before testing the new account's login.

## Mobile app

Screens: home dashboard, timetable, exams & seating, notices, iVault documents,
chambers/community + forum posts, live chat, clubs & events, reels & stories,
iCareer (opportunities, projects, portfolio), the iAI assistant (chat, study
tools, smart search), plus auth, settings, help, edit-profile, content-creation,
and role dashboards (admin / lecturer / employer / club admin). Includes light &
dark themes. Data comes from the API; `frontend/src/data/mock.js` holds only
small fallback constants.

## Scripts (repo root)

- `npm run frontend` â€” start the Expo app
- `npm run backend` â€” start the API in watch mode
