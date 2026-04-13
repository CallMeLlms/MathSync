# Weekly XP activity & Profile bar graph

## Summary

- Added `xpSessionLog` to `useUserStore` (separate from the UI `activities` feed) with `logXpSession`, 30-day retention, and deduplication by `sessionId`.
- Documented event semantics and deduplication in an inline comment block on `xpSessionLog`.
- Extended `useGameEngine` with a per-session `sessionId` issued in `startGameSession`; `endGameSession` logs session total score via `logXpSession` then clears session state (including score).
- Implemented `aggregateWeeklyXp` (`src/utils/activityAggregator.js`) and `useWeeklyActivity` for a rolling 7-day local-calendar bucket chart.
- Replaced placeholder data in `ProfileBarGraph` with live data, empty-state copy, and Reanimated bar heights.

## Files touched

- `src/stores/user-stores/useUserStore.js`
- `src/stores/game-stores/useGameEngine.js`
- `src/utils/activityAggregator.js`
- `src/utils/activityAggregator.test.js`
- `src/hooks/useWeeklyActivity.js`
- `src/Components/Profile/ProfileBarGraph.jsx`
