# 2026-04-27 — Leaderboard Feature

## Summary
Added a **Leaderboard** feature accessible from the drawer navigation in the student mobile app.

## Changes Made

### Backend (`CAPSTONE/Backend`)
- **`src/controllers/game.submission.controller.js`**
  - Added `getSectionLeaderboard` — returns students ranked by average score for a given section
  - Added `getClassroomLeaderboard` — returns students ranked by average score across a classroom
  - Both functions return `rank`, `averageScore`, `totalSubmissions`, and `passRate` per student
  - Uses `authorize` middleware (accessible by both students and teachers)

- **`src/routers/game.submission.route.js`**
  - Added `GET /analytics/section/:sectionId/leaderboard` → `getSectionLeaderboard`
  - Added `GET /analytics/classroom/:classroomId/leaderboard` → `getClassroomLeaderboard`
  - Both routes use `authorize` (not `authorizeAdmin`) so students can access their own leaderboard

### Mobile (`CAPSTONE/MOBILE 2.0`)
- **`src/services/gameAnalyticsService.js`** *(new)*
  - Service class wrapping `getSectionLeaderboard` and `getClassroomLeaderboard` API calls

- **`app/(drawer)/Leaderboard.jsx`** *(new)*
  - Standalone drawer screen showing ranked leaderboard
  - Fetches the student's classrooms and auto-selects the first one
  - Horizontal chip tabs to switch between classrooms (if multiple)
  - Gold/Silver/Bronze medal styling for top 3 using layered borders (no shadows)
  - Shows: rank, avatar, username, games played, pass rate, average score
  - Pull-to-refresh, empty state, and error state
  - Fonts: `Lexend-Black` for headers/scores, `PlusJakartaSans` for body

- **`app/(drawer)/_layout.js`**
  - Registered `Leaderboard` drawer screen with `MaterialCommunityIcons trophy-outline` icon
