# Exam Feature — Phase 1 Scaffold

**Date:** 2026-04-26
**Branch:** development-branch
**Author:** Justine L. Llamera

---

## Why This Was Built

MathSync had two game flows — Curriculum (Grade 1, JSON-driven) and Generative (G2–G6, procedural) — but neither supported exam conditions. Both stacks show immediate correct/wrong feedback after every answer, support only linear question progression, and pull data from local JSON. None of those behaviors are appropriate for a formal exam.

The goal was to introduce a **third, fully isolated game stack** that:
- Pulls exam data exclusively from the backend (MongoDB, not local JSON)
- Shows **no feedback** mid-exam — students never know if an answer is right or wrong until they submit
- Allows **free navigation** between questions — student can jump to any question at any time
- Uses **mutable answer state** — student can overwrite answers before submitting
- Awards XP/badges **only after confirmed backend submission** — not before

Phase 1 establishes the entire folder structure, all component scaffolds, service contracts, and dev mock data. No backend endpoints exist yet; the stack runs entirely off a local JSON mock in `__DEV__` mode.

---

## New Directory Created

```
src/Components/Game/Exam/         ← new top-level exam stack (isolated from Curriculum + Generative)
app/exam/                         ← new Expo Router route group
src/services/examService.js       ← new
src/services/examSubmissionService.js  ← new
content/game-data/dev/examLabQuestionBank.json  ← new (DEV ONLY)
```

---

## Files Created

---

### `src/Components/Game/Exam/ExamOrchestrator.jsx`

**Role:** Core session controller for the exam stack. Mirrors `CurriculumOrchestrator` structurally but has fundamentally different session logic.

**Why it was written this way:**

- **Data source is the backend, not local JSON.** `getExamById(examId)` fetches the exam via `examService.js`. In `__DEV__` mode, a `mockData` prop bypasses the API so development can proceed before backend endpoints exist.
- **No `useGameEngine.recordAnswer()` per interaction.** In curriculum, `recordAnswer()` is called after each question and accumulates score. In exam mode, the student can change answers, so accumulated score events cannot be trusted. Score is derived at submission time from the final `answers` map.
- **`handleResult` is a mutable overwrite, not an append.** Every time a student answers a question, the entry at `answers[questionId]` is fully replaced. There is no append-only history.
- **Three answer states, not boolean.** `'unanswered'` is never coerced to `false` or `null`. This preserves the distinction between "student skipped this question" and "student answered incorrectly" in the review screen and backend payload.
- **`questionSnapshot` is frozen at answer time.** Each answer entry captures `{ type, question, answer, metadata }` from the question object at the moment the student taps CHECK. This protects analytics if a teacher later edits the exam — the submission records what the student actually saw.
- **`submittedRef` prevents double-fire.** A `useRef(false)` guard blocks `handleSubmit` from running twice on rapid taps or race conditions. It is reset to `false` only on submission failure (to allow retry).
- **XP/badges only fire after confirmed submission.** `endGameSession()` is called inside the `try` block after `submitExam()` resolves. It is never called before. This prevents phantom XP if the network request fails.
- **Cleanup effect exits session on unmount.** If the user taps the exit button mid-exam without submitting, the `useEffect` cleanup fires `endGameSession()` so the Zustand store does not hold a dangling open session.
- **`GESTURE_ENGINES` set.** Some engines (dragdrop, connectdots, shapetracer, geoboard, clocksetter) use touch responders that conflict with `ScrollView`. The orchestrator detects these types and wraps them in a plain `View` instead.
- **All 27 curriculum engines are imported and routed.** Phase 1 reuses all existing engines as a compatibility layer. Phase 1.5 replaces key types with dedicated exam engines.
- **`MatcherEngine` legacy adapter.** `MatcherEngine` uses `{ question, onAnswer }` props instead of the standard `{ data, onResult }`. A thin inline adapter handles this in the switch case without modifying the engine.

**Phase states:**
| State | Meaning |
|---|---|
| `'exam'` | Active — student is answering questions |
| `'submitting'` | API call in progress — spinner shown on submit button |
| `'review'` | Submission confirmed — `ExamResultScreen` rendered inline |

---

### `src/Components/Game/Exam/ExamHUD.jsx`

**Role:** Top bar UI shown throughout the exam (title, progress, current question index, exit button).

**Props:** `{ title, currentIndex, totalQuestions, answeredCount, onExit }`

**Design decisions:**
- Three-zone horizontal layout: exit button (left) / title + progress (center) / question index badge (right).
- Exit button uses `Ionicons "close"` with tactile border styling (2px side, 4px bottom) — consistent with app-wide depth convention.
- `answeredCount / totalQuestions` subtitle gives the student a running count without revealing correctness.
- Current index badge (`currentIndex + 1` / `totalQuestions`) uses `Lexend-Bold` at 18px primary color — visually distinct from subtitle.
- No color theming or grade theming — exam is grade-agnostic.
- `borderBottomWidth: 2` + `Colors.outlineVariant` separates HUD from engine area using the app's standard depth border pattern.

---

### `src/Components/Game/Exam/ExamQuestionNav.jsx`

**Role:** Horizontal scrollable dot navigator. Shows one numbered button per question. Color-coded by answer status. Tapping any dot navigates directly to that question.

**Props:** `{ questions, answers, currentIndex, onSelect }`

**Design decisions:**
- `STATUS_COLORS` maps three states to theme tokens: `unanswered` → `Colors.outlineVariant` (grey), `answered_correct` → `Colors.tertiary` (green), `answered_incorrect` → `Colors.error` (red). This is the only feedback the student sees mid-exam — they know *whether* they answered, not *whether they were right*.
- Active dot gets `Colors.primary` border and text instead of a size change — avoids layout shifts in the scroll row.
- Horizontal `ScrollView` supports exams with many questions without overflow.
- `borderTopWidth: 2` + `Colors.outlineVariant` separates nav from engine area (same depth-border convention as HUD).
- `QUESTIONS` label in uppercase small caps above the dots orients first-time users.
- Dots are `36x36` borderRadius 10 with `borderBottomWidth: 4` — consistent tactile depth styling.

---

### `src/Components/Game/Exam/ExamResultScreen.jsx`

**Role:** End-of-exam review screen. Rendered inline inside `ExamOrchestrator` when `phase === 'review'`. Shows final score and a per-question breakdown.

**Props:** `{ examTitle, questions, answers, onBackToClassroom }`

**Design decisions:**
- **Score header** uses `Lexend-Black 52px` for the correct count — high visual impact, consistent with game result screens.
- **Percentage** calculated from `correct / total * 100` (rounded). Unanswered questions count against the score.
- **Unanswered warning** shown only if `unanswered > 0` — red text notifying the student how many questions they left blank.
- **`questionSnapshot.question`** is used for the question text in each review card, not the live `q.question`. This ensures the review screen shows what the student actually saw, even if the teacher edits the exam after submission.
- **Correct answer revealed** only when the student did not answer correctly (`status !== 'answered_correct'`). Students who answered correctly do not see the answer text — there is nothing to correct.
- **Three-state card icons** (`Ionicons`): `answered_correct` → `checkmark-circle` (tertiary), `answered_incorrect` → `close-circle` (error), `unanswered` → `remove-circle` (outlineVariant).
- **"Back to Classroom"** uses `router.replace` via the `onBackToClassroom` callback — pops back to the classroom screen cleanly.
- `questionSnapshot.answer` falls back to `q.answer` in case an early question was answered before Phase 1 snapshot was live.

---

### `app/exam/[examId].jsx`

**Role:** Expo Router entry point for the exam route. Receives `examId`, `classroomId`, `sectionId` from URL params and mounts `ExamOrchestrator`.

**Why it was written this way:**
- `Stack.Screen options={{ headerShown: false }}` — ExamHUD is the custom header; the system header is hidden.
- `mockData = __DEV__ ? examLabData : null` — in development, the local JSON bypasses the API. In production, `null` triggers the live `getExamById()` path inside `ExamOrchestrator`. This switch is automatic — no manual toggle needed.
- Import path `@content/game-data/dev/examLabQuestionBank.json` — uses the `@content` alias defined in `babel.config.js`.

---

### `src/services/examService.js`

**Role:** Frontend service wrapper for backend exam GET endpoints. Fully scaffolded with inline contract documentation — no live backend yet.

**Functions:**
- `getExamById(examId)` → `GET /api/v1/exams/:examId` — returns the full exam object including questions array
- `getClassroomExams(classroomId)` → `GET /api/v1/classrooms/:classroomId/exams` — returns exam list summaries for a classroom

**Why inline comments:** The backend exam model and routes do not exist yet. The inline comments document the expected response shape, middleware requirements, and error codes so the backend author can build matching endpoints without guessing.

**Auth:** `apiManager` Bearer token interceptor handles authentication automatically — same as all other services.

---

### `src/services/examSubmissionService.js`

**Role:** Frontend service wrapper for exam submission and analytics endpoints. Fully scaffolded with inline contract documentation.

**Functions:**
- `submitExam({ examId, classroomId, sectionId, totalScore, totalItems, answers })` → `POST /api/v1/exam-submissions`
- `getExamAnalytics(sectionId)` → `GET /api/v1/exam-submissions/analytics/section/:sectionId`

**Why `studentId` is NOT sent in the request body:** The backend reads `req.user.id` from the JWT injected by `apiManager`'s auth interceptor — same pattern as `game-submissions`. Sending `studentId` in the body would be a security issue (client could spoof any student ID).

**Backend validation requirements documented inline:**
1. Verify `exam._id` exists and `exam.classroomId` matches submitted `classroomId`
2. Verify `req.user.id` is in `section.students` for the given `sectionId`
3. Enforce unique index on `[examId, studentId]` — return 409 on duplicate submission
4. Never trust `classroomId`/`sectionId` from body alone — verify against DB

**`questionSnapshot` in the answers array:** Each submitted answer includes a frozen copy of the question text and correct answer at the time the student answered. This protects historical submissions if a teacher later edits exam content.

---

### `content/game-data/dev/examLabQuestionBank.json`

**Role:** DEV-ONLY local mock data used as `mockData` prop in `app/exam/[examId].jsx` during Phase 1 development before backend endpoints exist.

**Structure:** Mirrors the expected backend exam response shape — `meta` object (examId, title, timeLimit, totalItems) + `questions` array.

**Original contents (Phase 1):** 8 questions covering PICKER (x2), NUMPAD (x2), VISUAL_PICKER (x1), COMPARE_PICKER (x1), COMPARE_ORDER (x1), WORD_PROBLEM (x1) — intended for engine compatibility spike across multiple engine types.

**Updated in Phase 1.5:** Trimmed to 4 questions (2x NUMPAD, 2x VISUAL_PICKER) to match the two dedicated exam engines being developed. Other engine types removed from the test bank to keep the dev spike focused.

---

## Files Modified

---

### `app/classroom/[id].jsx`

**Why it was modified:** The Classroom screen is the entry point for all student content. Exams need a tab here, but the backend endpoints don't exist yet. A shadow feature pattern was used to install the code without exposing it to users.

**What changed:**

**New state added (lines 20–21):**
```js
const [examsData, setExamsData] = useState([]);
const [loadingExams, setLoadingExams] = useState(false);
```
Reason: These hold the exam list for the Exams tab when it's eventually live. Declared now so `renderExams()` can reference them without lint errors.

**New `renderExams()` function added (lines 143–183):**
- Renders `ActivityIndicator` when `loadingExams` is true
- Renders empty-state icon + message when `examsData` is empty
- Maps `examsData` to exam cards with `Feather "clipboard"` icon, title, item count, and optional due date
- Each card navigates to `/exam/${exam._id}?classroomId=${id}&sectionId=${sectionId}` on press
- Function is fully wired but never called unless `activeTab === 'exams'` — which only happens when the tab button is unhidden

**Hidden Exams tab button added (lines 253–262):**
```jsx
{false && (
  <TouchableOpacity ...>
    <Text>Exams</Text>
  </TouchableOpacity>
)}
```
Reason: The `{false && ...}` guard means this code compiles and type-checks cleanly but never renders. Remove the `false &&` wrapper in Phase 2 to unhide the tab when backend endpoints are live.

**Content area ternary updated (line 272):**
```js
activeTab === 'lessons' ? renderLessons() : activeTab === 'exams' ? renderExams() : renderAssignments()
```
Reason: Routes `activeTab === 'exams'` to `renderExams()`. This was added proactively so the dispatch logic is already correct when the tab is unhidden.

**What was NOT changed:** `renderLessons()`, `renderAssignments()`, `fetchData()`, all existing state, all existing params, and all existing tab buttons were left completely untouched.

---

## Key Architectural Decisions

### 1. No `useGameEngine.recordAnswer()` per interaction
**Why:** `recordAnswer()` is append-only and accumulates score events over time. In exam mode, a student can change their answer — there is no way to "un-record" a previous answer. Calling it per-interaction would produce an inflated, incorrect score. Instead, the final `answers` map is evaluated at submission time to compute `correctCount` and `totalScore` before calling `endGameSession()`.

### 2. XP and badges only fire after confirmed submission
**Why:** `endGameSession()` logs XP to the weekly chart, adds an activity feed entry, and fires badge evaluation. These side effects must only happen once and only when the submission is confirmed saved on the backend. Firing before `submitExam()` resolves would create phantom XP if the network request fails. `endGameSession()` is called inside the `try` block, never in `catch` or `finally`.

### 3. Three answer states — `'unanswered'` is not `false`
**Why:** A student who never reached a question is different from a student who answered incorrectly. The review screen renders a distinct grey state for unanswered questions. The submission payload sends `isCorrect: null` (not `false`) for unanswered questions so the backend can distinguish the two cases for analytics.

### 4. `questionSnapshot` frozen at answer time
**Why:** If a teacher edits exam content after students have already submitted (changing question text or the correct answer), historical submissions would become unreadable — the review screen would show different text than what the student saw. `questionSnapshot` captures `{ type, question, answer, metadata }` at the exact moment the student taps CHECK, making submissions immune to future edits.

### 5. Shadow feature pattern for the Exams tab
**Why:** The tab button is installed but wrapped in `{false && ...}` so it never renders. This approach keeps the code reviewable, avoids a messy feature-flag system, and prevents users from accidentally discovering an incomplete feature. A single line change (`remove false &&`) is all that's needed to enable it.

### 6. Isolated third stack — no modifications to Curriculum or Generative
**Why:** The exam stack has fundamentally different session semantics. Merging it with CurriculumOrchestrator via flags or props would create fragile conditional logic throughout. Isolation ensures exam behavior changes never accidentally affect lesson gameplay.

---

## Next Steps

### Phase 1.5 — Dedicated Exam Engines (current)
- Build `src/Components/Game/Exam/Engines/ExamNumpadEngine.jsx`
- Build `src/Components/Game/Exam/Engines/ExamVisualPickerEngine.jsx`
- Update `ExamOrchestrator` to route `numpad` and `visual_picker` to the new engines
- Trim `examLabQuestionBank.json` to 4 questions matching these two types

### Phase 2 — Backend & Live Wiring (deferred)
1. Build backend: `exam.model.js`, `exam.submission.model.js`, `exam.controller.js`, `exam.route.js`
2. Remove `mockData` prop from `app/exam/[examId].jsx` once endpoints are live
3. Unhide Exams tab in `app/classroom/[id].jsx` (remove `false &&` guard)
4. Wire `getClassroomExams()` fetch inside `renderExams()` on tab activation

### Phase 3 — Advanced Features (deferred)
- Countdown timer (from `exam.timeLimit`)
- Question flagging
- Animated result screen (Lottie celebrate on high score)
- Offline submission retry queue (AsyncStorage)
