# Game Submission API Integration

**Date:** 2026-04-26  
**Branch:** development-branch  
**Author:** Justine L. Llamera

---

## Summary

Wired the classroom "Play Lesson" game flow to POST session results to the backend `POST /api/v1/game-submissions` endpoint. Submission fires fire-and-forget after local state is persisted; it is gated on all three classroom context IDs being present so Journey Map play is unaffected.

---

## Files Changed

| File | Change |
|---|---|
| `src/services/gameSubmissionService.js` | CREATED — thin `apiManager.post` wrapper |
| `app/classroom/[id].jsx` | MODIFIED — adds `classroomId=${id}` to lesson nav URL |
| `app/classroom/lesson/[lessonId].jsx` | MODIFIED — extracts `sectionId`/`classroomId`, threads to game route |
| `app/game/[lessonId].jsx` | MODIFIED — extracts classroom params, passes to `CurriculumOrchestrator` |
| `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | MODIFIED — collects answers, fires submission on completion |

---

## Key Decisions

- `studentId` not sent — backend derives it from Bearer token via `req.user.id`
- `learningOutcomeId` is `null` for all answers — full mapping deferred
- Submission only fires when `sectionId`, `classroomId`, AND `mongoLessonId` are all non-empty strings
- `submittedRef` one-shot guard prevents duplicate submissions on replay
- `answersRef` reset on every new `useEffect` mount to prevent cross-session answer accumulation
- Local save (`recordSessionResult` + `endGameSession`) always completes before API fires

---

## Reference

Full architectural document: `.agents/document/2026-04-26_00-00-00_game-submission-api-Document.md`
