# iCollege 📱

> Your Campus. Your Community. Your Future.

A student-centered digital ecosystem mobile app (React Native + Expo). This
repository is the **Phase-1 UI build** — the screens from the product mockups,
wired with local/mock data (no backend yet).

## Tech stack

- **Expo SDK 57** (React Native 0.86, React 19)
- **expo-router** (file-based navigation, typed routes)
- **TypeScript**
- **@expo/vector-icons** (Ionicons) for iconography
- Local mock data — no backend yet

## Running the app

```bash
npm install          # already done
npx expo start       # then press: a (Android) · i (iOS) · w (web)
```

Scan the QR code with the **Expo Go** app on your phone, or launch an emulator.

## Project structure

```
src/
├─ app/                       # expo-router routes
│  ├─ _layout.tsx             # root stack (tabs + timetable + chamber)
│  ├─ (tabs)/
│  │  ├─ _layout.tsx          # tab navigator (custom TabBar)
│  │  ├─ index.tsx            # 🏠 Home dashboard
│  │  ├─ community.tsx        # 👥 Community (chambers list)
│  │  ├─ create.tsx           # ➕ Create hub
│  │  ├─ messages.tsx         # 💬 Messages
│  │  └─ profile.tsx          # 👤 Profile
│  ├─ timetable.tsx           # Timetable (Day/Week/Month/Agenda)
│  └─ chamber/[id].tsx        # Chamber detail (Feed, posts, etc.)
├─ components/
│  ├─ TabBar.tsx              # custom bottom bar w/ floating center "+"
│  └─ ui/                     # Card, Pill, IconTile, Avatar, SectionHeader
├─ data/mock.ts               # all mock/local data
└─ theme/index.ts            # design system (colors, spacing, radii, type)
```

## Screens implemented (from the mockups)

| Screen | Route | Notes |
|--------|-------|-------|
| Home dashboard | `/` | Hero cards, quick-action grid, alert banner, chambers, recommended |
| Timetable | `/timetable` | Segmented views, week strip, stats, class cards w/ status pills |
| Chamber detail | `/chamber/[id]` | Color-themed per chamber, tabs, composer, pinned/trending/latest |
| Community | `/community` | Chambers list → chamber detail |
| Create | `/create` | Post / Reel / Story / Project / Event / Material / Discussion / Competition |
| Messages | `/messages` | Conversation list w/ unread badges |
| Profile | `/profile` | Success score, achievements, portfolio menu |

## Next steps (roadmap)

- Phase 1 remaining: Exams, Exam Seating, Notices, My Documents, Auth
- Phase 2: iForum, live chat, clubs, events, reels & stories
- Phase 3: iCareer, jobs, projects, employer portal
- Phase 4: AI assistant, AI search, study & career matching
- Backend: swap `src/data/mock.ts` for a real API / BaaS layer
