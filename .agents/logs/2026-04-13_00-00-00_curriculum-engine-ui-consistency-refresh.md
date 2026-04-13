# Curriculum Engine UI Consistency Refresh

**Date:** 2026-04-13
**Scope:** Curriculum Stack only (`src/Components/Game/Curriculum/`)

---

## Problem

The curriculum game UI had grown inconsistently across 9 engines:

1. **HUD clutter** — the top bar showed a text "Leave Garden" exit button and a live score counter.
2. **Question display fragmentation** — some engines (Picker, Matcher) rendered the question text inside their own body; others showed it in a small dynamic hint badge; a few did not render it at all.
3. **No visual separation** — engine content packed tightly below the HUD with no clear contextual break between "what to do" and "how to do it".

---

## Solution

Centralized question display and HUD into the Orchestrator. Engines are now truly "dumb" UI surfaces — they receive `data` and emit `onResult`, with no ownership over the question header.

### Layout shell (post-change)

```
┌─────────────────────────────┐
│  [×]                        │  ← HUD: icon-only circular exit button
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  Question text (bold)   │ │  ← Bordered card, Orchestrator-owned
│ └─────────────────────────┘ │
│                             │
│   [Engine content area]     │  ← flex: 1, paddingTop: 24
│                             │
└─────────────────────────────┘
```

---

## Files Changed

### `CurriculumOrchestrator.jsx`

- **HUD**: removed text exit button and score counter. Replaced with a single 40×40 circular `TouchableOpacity` containing `<Ionicons name="close" size={24} />`.
- **Question header**: new conditional section renders a bordered card (`surfaceContainerLow` bg, `outlineVariant` border, `borderRadius: 20`) between the HUD and the engine wrapper. Derives text from `currentQuestion?.question || currentQuestion?.instruction || currentQuestion?.text`. Renders nothing when no text is present (e.g. ComposeEngine, NumpadEngine).
- **`engineWrapper`**: added `paddingTop: 24` for breathing room below the question card.
- **Dead styles removed**: `exitText`, `scoreText`, `successContainer`, `successTitle`, `successScore`, `finishButton`, `finishText` — all dead code since lesson completion routes to `/game/result`.

### `MatcherEngine.jsx`

- Removed static `questionContainer` / `questionText` block (was duplicating what the Orchestrator now owns).
- Replaced with a slim `hintContainer` showing only the dynamic `instructionHint` string.
- Removed unused `FadeInDown` import and `questionText` destructure alias.

### `PickerEngine.jsx`

- Removed static `questionCard` / `questionText` block.
- Replaced with a slim `hintContainer` showing only the dynamic `getInstruction()` hint.
- Cleaned unused imports: `withSequence`, `withTiming`, `FadeInDown`, `SCREEN_WIDTH`.
- `questionText` destructure retained — still used by `speechManager.speakInstruction()` for TTS.

---

## Design Decisions

- **Question card style** follows the bordered-container pattern used throughout the design system (`surfaceContainerLow` + `outlineVariant` border + rounded corners), consistent with hint badges, match tiles, and progress indicators.
- **Font**: `Lexend-Bold` at 24px / lineHeight 32 — matches `OrderingEngine`'s `displayQuestion` treatment, used as the reference.
- **Engines not modified**: ComposeEngine, ConnectDotsEngine, DragAndDropEngine, NumpadEngine, OrdinalSequenceEngine, ShapeHuntEngine, ShapeTracerEngine, SortEngine — these already keep question text in a small dynamic hint that changes with game state, not as a static header.

---

## Invariants Preserved

- Engine prop contracts unchanged (`{ data, onResult }`; MatcherEngine legacy `{ question, onAnswer }` bridge kept in Orchestrator).
- `key={currentQuestionIndex}` on all engines — clean remount between questions.
- TTS via `speechManager` unaffected in all engines.
