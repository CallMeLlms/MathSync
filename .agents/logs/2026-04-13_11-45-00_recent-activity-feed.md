## Summary

Implemented a persisted **Recent Activity** feed for the Profile screen.

## What changed

- **User store**: Added `recentActivity` to `src/stores/user-stores/useUserStore.js`, persisted via the existing Zustand+AsyncStorage setup.
  - New actions: `addRecentActivity(...)` (prepend + cap at 30), `clearRecentActivity()`.
  - Storage shape: `{ id, iconType, iconValue, timestampUtc, description }` with `timestampUtc` stored as ISO.
- **Game session hook**: On session end (`src/stores/game-stores/useGameEngine.js`), we now log a recent-activity entry alongside the existing XP session log.
- **Profile UI**: Refactored `src/Components/Profile/ActivityFeed.jsx` to render from `useUserStore().recentActivity` and display **icon + relative time + description only** (no points).

## Constraints / invariants

- Feed is capped at **30 items** (oldest dropped).
- Icons limited to **emoji** or **MaterialIcons**.
- UI adheres to shadow-free design guidelines (no `shadow*` or `elevation`).

