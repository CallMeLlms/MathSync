# Exam Feature — Phase 1 Scaffold

**Date:** 2026-04-26
**Branch:** development-branch
**Author:** Justine L. Llamera

---

## Summary

Established the full Phase 1 folder structure and scaffolding for the Exam Type Screen — a third game stack (alongside Curriculum and Generative) where exam data comes from the backend, students see no feedback mid-exam, can jump freely between questions, and review results only after submission.

---

## Files Created

### New Stack — `src/Components/Game/Exam/`
- [ExamOrchestrator.jsx](../../../src/Components/Game/Exam/ExamOrchestrator.jsx) — Core session controller. Loads exam via API (or `mockData` in dev). Mutable three-state answer tracking (`unanswered` / `answered_correct` / `answered_incorrect`). Awaits submission confirmation before awarding XP via `useGameEngine.endGameSession()`.
- [ExamHUD.jsx](../../../src/Components/Game/Exam/ExamHUD.jsx) — Top bar: title, answered count, current question index, exit button.
- [ExamQuestionNav.jsx](../../../src/Components/Game/Exam/ExamQuestionNav.jsx) — Horizontal dot navigator. Colour-coded by answer status. Tap any dot to jump to that question.
- [ExamResultScreen.jsx](../../../src/Components/Game/Exam/ExamResultScreen.jsx) — End-of-exam review. Shows score, per-question correct/incorrect/unanswered breakdown using `questionSnapshot` (frozen at answer time, immune to later exam edits).

### New Route — `app/exam/`
- [app/exam/[examId].jsx](../../../app/exam/[examId].jsx) — Expo Router entry point. Passes `mockData` from `examLabQuestionBank.json` in `__DEV__` mode; `null` in production (triggers live API path).

### New Services — `src/services/`
- [examService.js](../../../src/services/examService.js) — Scaffolded `getExamById()` and `getClassroomExams()` with full inline backend contract documentation.
- [examSubmissionService.js](../../../src/services/examSubmissionService.js) — Scaffolded `submitExam()` and `getExamAnalytics()` with full inline contract + backend validation requirements.

### Dev Test Data — `content/game-data/dev/`
- [examLabQuestionBank.json](../../../content/game-data/dev/examLabQuestionBank.json) — 8-question mock exam covering PICKER, NUMPAD, VISUAL_PICKER, COMPARE_PICKER, COMPARE_ORDER, WORD_PROBLEM. Used as `mockData` during Phase 1 development and engine compatibility spike.

---

## Files Modified

### `app/classroom/[id].jsx`
- Added shadow exam state: `examsData`, `loadingExams` (not yet fetched).
- Added `renderExams()` — fully scaffolded exam card list referencing `/exam/:id` route.
- Added hidden Exams tab button wrapped in `{false && ...}` — invisible to users, compiles cleanly. Remove guard in Phase 2 when backend endpoints are live.
- Content area updated to dispatch to `renderExams()` when `activeTab === 'exams'`.

---

## Key Architectural Decisions

- **No `useGameEngine.recordAnswer()` per interaction** — score is derived from the final answers map at submission time. Students can overwrite answers before submitting.
- **XP/badges fire only after confirmed submission** — `endGameSession()` is called inside the `try` block after `submitExam()` resolves, not before.
- **Three answer states** — `unanswered` is never coerced to `false`. The review screen renders a distinct grey state for unanswered questions.
- **`questionSnapshot`** — each answer freezes the question text and correct answer at response time, protecting analytics against future exam edits.
- **Engine compatibility spike required** — before full Phase 2 wiring, confirm representative engines (PICKER, NUMPAD, MATCHER, COMPARE_PICKER) work without immediate-feedback modals or forced navigation in exam context.

---

## Next Steps (Phase 2)

1. Build backend: `exam.model.js`, `exam.submission.model.js`, `exam.controller.js`, `exam.route.js`
2. Run engine compatibility spike using `examLabQuestionBank.json`
3. Remove `mockData` prop from `app/exam/[examId].jsx` once endpoints are live
4. Unhide Exams tab in `app/classroom/[id].jsx` (remove `false &&` guard)
5. Wire `getClassroomExams()` fetch inside `renderExams()` on tab activation
