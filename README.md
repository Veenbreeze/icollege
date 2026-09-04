# iCollege

> Your Campus. Your Community. Your Future.

iCollege is a student-centered digital ecosystem. This repository contains the Phase-1 Expo mobile UI and a Node.js API starter.

## Workspace structure

- `frontend/` - Expo SDK 57 React Native application using Expo Router and TypeScript.
- `backend/` - Node.js / Express API.
- `reqs/` - Local requirements and UI references; excluded from Git.

## Run locally

Install dependencies for each application:

```bash
npm --prefix frontend install
npm --prefix backend install
```

Start the mobile app:

```bash
npm run frontend
```

Start the API in another terminal:

```bash
npm run backend
```

The API health endpoint is `GET http://localhost:4000/api/health`.

## Mobile app

The mobile UI includes dashboard, timetable, chamber/community, create, messages, profile, authentication, exams, notices, documents, career, AI, and related routes. It currently uses local mock data from `frontend/src/data/mock.ts`.
