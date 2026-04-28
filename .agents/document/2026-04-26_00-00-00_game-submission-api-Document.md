# Game Submission API Integration — Architecture Document

**Date:** 2026-04-26  
**Branch:** development-branch  
**Author:** Justine L. Llamera  
**Type:** Feature Enhancement — Mobile ↔ Backend Bridge  

---

## 1. Overview

This document details the full architectural plan for wiring the MathSync frontend (Expo / React Native) to the backend `POST /api/v1/game-submissions` endpoint. When a student completes a curriculum lesson accessed via the classroom "Play Lesson" button, a background API call will submit the session result to the MongoDB backend.

This is strictly an **additive enhancement** — no existing local save logic, navigation flow, or engine contracts are modified. The submission fires after all local state has been persisted.

---

## 2. Problem Statement

Before this change, the classroom lesson game flow was entirely disconnected from the backend:

- A student could tap "Play Lesson" inside a classroom lesson and complete a curriculum game
- The result (score, answers, accuracy) was saved **only locally** via Zustand + AsyncStorage
- The teacher's backend had zero visibility into whether students actually played or how they performed
- The `game-submissions` MongoDB collection existed but was never populated by the mobile client

---

## 3. Backend Contract

### Endpoint
```
POST /api/v1/game-submissions
Authorization: Bearer <accessToken>
```

### Request Body
```json
{
  "sectionId":   "<MongoDB ObjectId>",
  "classroomId": "<MongoDB ObjectId>",
  "lessonId":    "<MongoDB ObjectId>",
  "totalScore":  80,
  "totalItems":  10,
  "answers": [
    {
      "question":          "What shape has 3 sides?",
      "learningOutcomeId": null,
      "isCorrect":         true
    }
  ]
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Game submission successful",
  "newSubmission": {
    "_id":         "...",
    "studentId":   "...",
    "sectionId":   "...",
    "classroomId": "...",
    "lessonId":    "...",
    "totalScore":  80,
    "totalItems":  10,
    "answers":     [...],
    "createdAt":   "2026-04-26T...",
    "updatedAt":   "2026-04-26T..."
  }
}
```

### Response (400 Bad Request)
```json
{ "success": false, "message": "<error details>" }
```

### Key Backend Behavior
- `studentId` is **NOT** sent in the request body. The backend's `authorize` middleware decodes the JWT and sets `req.user`. The controller reads `req.user.id` as `studentId`.
- The `apiManager.js` interceptor already attaches the Bearer token to every request — no additional auth wiring needed.
- `learningOutcomeId` per answer is `null` for now. Question banks use `competency` codes (e.g. `"MG.1.1"`) but these don't map 1:1 to MongoDB ObjectIds. Full mapping is deferred to a future task.

### Backend Files (Reference)
| File | Path |
|---|---|
| Model | `D:\LAWLL\VISUALSHIT\GITREPO\Capstone\BackEnd\src\models\game.submission.model.js` |
| Controller | `D:\LAWLL\VISUALSHIT\GITREPO\Capstone\BackEnd\src\controllers\game.submission.controller.js` |
| Router | `D:\LAWLL\VISUALSHIT\GITREPO\Capstone\BackEnd\src\routers\game.submission.route.js` |

---

## 4. Architecture Context

### 4.1 Dual-Stack Game System (Relevant to This Change)
This feature only affects **Stack 1 — Curriculum** (G1). Stack 2 (Generative, G2–G6) is untouched.

```
Stack 1 (Curriculum — G1):
  app/game/[lessonId].jsx
    └── CurriculumOrchestrator.jsx
          ├── lessonResolver.js  (resolves JSON question banks)
          └── Engines/           (PICKER, NUMPAD, MATCHER, etc.)
```

### 4.2 Classroom Navigation Chain (Before This Change)
```
app/classroom/[id].jsx
  → /classroom/lesson/{lesson._id}?sectionId=...&grade=G1&quarter=1
      app/classroom/lesson/[lessonId].jsx
        → /game/{gameLessonId}?grade=G1
            app/game/[lessonId].jsx
              → CurriculumOrchestrator (lessonId, gradeKey)
```

### 4.3 Classroom Navigation Chain (After This Change)
```
app/classroom/[id].jsx
  → /classroom/lesson/{lesson._id}?sectionId=...&classroomId=...&grade=G1&quarter=1
      app/classroom/lesson/[lessonId].jsx
        → /game/{gameLessonId}?grade=G1&sectionId=...&classroomId=...&mongoLessonId={lesson._id}
            app/game/[lessonId].jsx
              → CurriculumOrchestrator (lessonId, gradeKey, sectionId, classroomId, mongoLessonId)
                  on complete → submitGameSession() [fire-and-forget]
                    → POST /api/v1/game-submissions
```

### 4.4 ID Vocabulary (Critical — Two Different "lessonId" Values)
| Name | Type | Source | Description |
|---|---|---|---|
| `gameLessonId` / `lessonId` (in game route) | `string "1"–"20"` | `resolveGameLesson()` | Local numeric ID used by `CurriculumOrchestrator` to load JSON question banks |
| `mongoLessonId` | MongoDB ObjectId string | URL param from classroom lesson `_id` | The classroom lesson's `_id` in MongoDB — sent to backend as `lessonId` |

These are never interchangeable. The game engine uses the local numeric ID; the backend only understands the MongoDB ObjectId.

---

## 5. Files Changed

### 5.1 NEW FILE — `src/services/gameSubmissionService.js`

**Purpose:** Thin wrapper over `apiManager` for the game submissions endpoint. Single exported function, no side effects, no local state.

**Full content:**
```js
import apiManager from '@/services/apiManager';

export async function submitGameSession({ sectionId, classroomId, lessonId, totalScore, totalItems, answers }) {
  const response = await apiManager.post('/game-submissions', {
    sectionId,
    classroomId,
    lessonId,
    totalScore,
    totalItems,
    answers,
  });
  return response.data;
}
```

**Notes:**
- Uses the authorized `@/` path alias
- `apiManager` already handles Bearer token injection and 401 refresh
- No explicit error handling here — callers decide how to handle failures

---

### 5.2 MODIFIED — `app/classroom/[id].jsx`

**Purpose:** Forward `classroomId` to the lesson detail screen. The classroom `id` route param is the MongoDB `_id` of the classroom — it is already destructured at line 11.

**Location of change:** Inside `renderLessons()` → `quarterData.lessons.map()` → `TouchableOpacity` `onPress` (line 114–116).

**Before:**
```js
onPress={() => {
  const gradeKey = classDetails?.name?.replace('GRADE ', 'G').replace(' ', '') ?? '';
  router.push(`/classroom/lesson/${lesson._id}?sectionId=${sectionId}&grade=${gradeKey}&quarter=${quarterData.quarter}`);
}}
```

**After:**
```js
onPress={() => {
  const gradeKey = classDetails?.name?.replace('GRADE ', 'G').replace(' ', '') ?? '';
  router.push(`/classroom/lesson/${lesson._id}?sectionId=${sectionId}&classroomId=${id}&grade=${gradeKey}&quarter=${quarterData.quarter}`);
}}
```

**What changed:** Added `&classroomId=${id}` to the URL. `id` is already available in scope from line 11: `const { id, sectionId } = useLocalSearchParams();`

**No new imports. No new state.**

---

### 5.3 MODIFIED — `app/classroom/lesson/[lessonId].jsx`

**Purpose:** Extract `sectionId` and `classroomId` from URL params and thread them forward to the game route along with the MongoDB lesson `_id`.

#### Change A — Params destructure (line 12)

**Before:**
```js
const { lessonId, grade, quarter } = useLocalSearchParams();
```

**After:**
```js
const { lessonId, grade, quarter, sectionId, classroomId } = useLocalSearchParams();
```

#### Change B — Play Lesson `onPress` (line 149)

**Before:**
```js
onPress={() => router.push(`/game/${gameLessonId}?grade=G1`)}
```

**After:**
```js
onPress={() => {
  const base = `/game/${gameLessonId}?grade=G1`;
  const ctx = (sectionId && classroomId)
    ? `&sectionId=${sectionId}&classroomId=${classroomId}&mongoLessonId=${lessonId}`
    : '';
  router.push(base + ctx);
}}
```

**Why the conditional?** Defensive guard — if classroom context params are somehow absent (e.g. navigated to this screen outside of classroom flow), the game still launches normally without the submission params. The `CurriculumOrchestrator` guard will then block the API call.

**Important:** `lessonId` here is the MongoDB `_id` of the classroom lesson (the Expo Router route param `[lessonId]`). `gameLessonId` is the local numeric ID resolved by `resolveGameLesson()`. They are completely different values.

**`grade` is already hardcoded as `G1` in the push** — this is intentional and correct. The Play Lesson button only renders when `grade === 'G1'` (line 61), so no dynamic grade value is needed here.

**No new imports. No new state.**

---

### 5.4 MODIFIED — `app/game/[lessonId].jsx`

**Purpose:** Extract the three classroom context params from URL and forward them to `CurriculumOrchestrator`.

#### Change A — Params destructure (line 14)

**Before:**
```js
const { lessonId, type, topicId, grade = 'G1' } = params;
```

**After:**
```js
const { lessonId, type, topicId, grade = 'G1', sectionId, classroomId, mongoLessonId } = params;
```

#### Change B — `CurriculumOrchestrator` JSX (lines 43–46)

**Before:**
```jsx
<CurriculumOrchestrator 
  lessonId={lessonId} 
  gradeKey={grade} 
/>
```

**After:**
```jsx
<CurriculumOrchestrator
  lessonId={lessonId}
  gradeKey={grade}
  sectionId={sectionId}
  classroomId={classroomId}
  mongoLessonId={mongoLessonId}
/>
```

**Generative path is unaffected** — `sectionId`, `classroomId`, `mongoLessonId` are only passed to `CurriculumOrchestrator`. The `GenerativeOrchestrator` branch does not receive them.

**No new imports. No new state.**

---

### 5.5 MODIFIED — `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`

This is the most significant change. Five targeted additions.

#### Change A — New import (after existing imports, top of file)
```js
import { submitGameSession } from '@/services/gameSubmissionService';
```

#### Change B — Prop signature (lines 55–58)

**Before:**
```js
export default function CurriculumOrchestrator({
  lessonId,
  gradeKey = 'G1'
}) {
```

**After:**
```js
export default function CurriculumOrchestrator({
  lessonId,
  gradeKey = 'G1',
  sectionId,
  classroomId,
  mongoLessonId,
}) {
```

#### Change C — Two refs (after existing hook destructures, before the first `useState`)

```js
const answersRef = React.useRef([]);       // per-question answer log for backend submission
const submittedRef = React.useRef(false);  // one-shot guard; prevents double submission
```

#### Change D — Reset refs + existing session init `useEffect` (lines 78–91)

**Before:**
```js
useEffect(() => {
  const content = getBundledLesson(gradeKey, lessonId);
  if (content) {
    setLessonContent(content);
    startGameSession(lessonId);
  } else {
    speechManager.speakInstruction(theme.loadingText);
  }

  return () => {
    endGameSession();
    speechManager.stop();
  };
}, [lessonId, gradeKey]);
```

**After:**
```js
useEffect(() => {
  answersRef.current = [];
  submittedRef.current = false;
  const content = getBundledLesson(gradeKey, lessonId);
  if (content) {
    setLessonContent(content);
    startGameSession(lessonId);
  } else {
    speechManager.speakInstruction(theme.loadingText);
  }

  return () => {
    endGameSession();
    speechManager.stop();
  };
}, [lessonId, gradeKey]);
```

**Why:** Ensures `answersRef` and `submittedRef` are clean on every new session. Without this, a replay (same `lessonId`) would accumulate answers from the previous session and the `submittedRef` would permanently block the second submission.

#### Change E — Collect answer in `handleResult` (lines 120–128)

**Before:**
```js
const handleResult = (isCorrect, userAnswerItems = []) => {
  recordAnswer(isCorrect);
  setLastResultData({
    isCorrect,
    userAnswerItems,
    currentQuestion
  });
  setShowResultModal(true);
};
```

**After:**
```js
const handleResult = (isCorrect, userAnswerItems = []) => {
  recordAnswer(isCorrect);

  answersRef.current.push({
    question: currentQuestion?.question || currentQuestion?.instruction || currentQuestion?.text || '',
    learningOutcomeId: null,
    isCorrect,
  });

  setLastResultData({
    isCorrect,
    userAnswerItems,
    currentQuestion
  });
  setShowResultModal(true);
};
```

**Why `currentQuestion?.question || currentQuestion?.instruction || currentQuestion?.text`:** Questions across different engines use different field names for the question text. This mirrors the same fallback chain already used at line 118 in the original file.

#### Change F — Fire submission in `handleComplete` (lines 137–157)

**Before:**
```js
const handleComplete = () => {
  if (currentQuestionIndex + 1 < lessonContent.questions.length) {
    nextQuestion();
  } else {
    const questionLength = lessonContent.questions.length;
    
    useUserStore.getState().recordSessionResult(gradeKey, lessonId, {
      correctCount,
      totalQuestions: questionLength,
      score: totalScore
    });

    endGameSession();
    
    router.replace({
      pathname: '/game/result',
      params: { lessonId, gradeKey },
    });
  }
};
```

**After:**
```js
const handleComplete = () => {
  if (currentQuestionIndex + 1 < lessonContent.questions.length) {
    nextQuestion();
  } else {
    const questionLength = lessonContent.questions.length;

    useUserStore.getState().recordSessionResult(gradeKey, lessonId, {
      correctCount,
      totalQuestions: questionLength,
      score: totalScore,
    });

    endGameSession();

    // Normalize params — Expo Router can deliver arrays on some navigations
    const sid  = typeof sectionId    === 'string' ? sectionId.trim()    : '';
    const cid  = typeof classroomId  === 'string' ? classroomId.trim()  : '';
    const mlid = typeof mongoLessonId === 'string' ? mongoLessonId.trim() : '';

    if (sid && cid && mlid && !submittedRef.current) {
      submittedRef.current = true;
      submitGameSession({
        sectionId:  sid,
        classroomId: cid,
        lessonId:   mlid,
        totalScore,
        totalItems: questionLength,
        answers:    answersRef.current,
      }).catch((err) => {
        console.warn('[GameSubmission] Failed to submit session:', err?.message ?? err);
      });
    }

    router.replace({
      pathname: '/game/result',
      params: { lessonId, gradeKey },
    });
  }
};
```

**Ordering is intentional:**
1. `recordSessionResult` — local Zustand persist (synchronous)
2. `endGameSession` — XP log + activity feed (synchronous)
3. Submission guard check + fire (async, non-blocking)
4. `router.replace` — navigates to result screen

Local saves complete before the API fires. Navigation is not blocked by the API call.

---

## 6. Guard Conditions & Safety Table

| Scenario | Behavior | Mechanism |
|---|---|---|
| Journey Map play (no classroom params) | No submission | `sid/cid/mlid` all `''` → guard fails |
| G2–G6 classroom (no Play Lesson button) | No submission | Params never set on game route |
| `mongoLessonId` absent | No submission | `mlid === ''` → guard fails |
| Any param is an array (Expo Router edge case) | No submission | `typeof x === 'string'` check → resolves to `''` |
| Double submission (replay, remount) | Submits once | `submittedRef.current = true` after first fire |
| API call fails (network, 400, 500) | Silent — local save preserved | `.catch` logs warning only |
| Early exit (user taps X mid-game) | No submission | `handleComplete` never reaches the `else` branch |
| `sectionId` truthy but `classroomId` empty | No submission | All three must be truthy |

---

## 7. Data Flow Diagram

```
[Teacher's MongoDB] ←→ [Backend API]
                              ↑
                    POST /api/v1/game-submissions
                    Bearer token → studentId derived
                              ↑
                   gameSubmissionService.js
                   (apiManager.post)
                              ↑
                   CurriculumOrchestrator.jsx
                   (fire-and-forget on completion)
                              ↑
                     app/game/[lessonId].jsx
                     (passes sectionId, classroomId, mongoLessonId)
                              ↑
                app/classroom/lesson/[lessonId].jsx
                (extracts params, adds to game route URL)
                              ↑
                    app/classroom/[id].jsx
                    (adds classroomId={id} to lesson URL)
                              ↑
                    [Student taps lesson in classroom]
```

---

## 8. Invariants Preserved

- `CurriculumOrchestrator` engine contracts (`data`, `onResult`) are untouched
- `lessonResolver.js` is untouched
- All game engines are untouched
- `useGameEngine` Zustand store is untouched
- `useUserStore` local save logic is untouched
- `app/game/[lessonId].jsx` generative branch is untouched
- `app/journey/[grade].jsx` Journey Map flow is untouched
- All authorized path aliases used: `@/` only
- No TypeScript — all new files use `.js`
- New service file uses `camelCase` + `.js` extension per convention
- No hardcoded hex colors, no new StyleSheet changes

---

## 9. Assumptions

- `apiManager.js` base URL already includes `/api/v1` — the path `'/game-submissions'` resolves correctly without duplication
- `lessonId` route param in `app/classroom/lesson/[lessonId].jsx` is a valid MongoDB ObjectId string (confirmed: it is the `lesson._id` from the backend API response)
- All three IDs are trusted MongoDB ObjectId strings when present — no client-side ObjectId format validation is added
- The existing `@services/lessonService` import in `app/classroom/lesson/[lessonId].jsx` (line 6) is a pre-existing non-standard alias; it is not touched by this task

---

## 10. Remaining Risks & Follow-Up Tasks

| Risk / Gap | Priority | Notes |
|---|---|---|
| `learningOutcomeId` is always `null` | Medium | Requires adding `learningOutcomeId` field to all question bank JSON files and threading it through `handleResult` |
| No retry / offline queue | Low | If network fails, the submission is permanently lost. Consider a local queue (AsyncStorage) that retries on next app launch |
| Non-standard `@services` alias on line 6 of lesson detail file | Low | Should be `@/services/lessonService` per project conventions — clean up in a separate PR |
| Submission timing on very fast completion | None | `answersRef` is synchronously populated inside `handleResult` before `handleComplete` is ever called — no race condition possible |
