# MathSync Interaction Consistency Decision Document

> Authored: 2026-04-19
> Status: Active reference
> Scope: Curriculum engines, question-bank design, feedback flows, shared UI behavior

---

## Purpose

This document captures product and architecture decisions based on current concerns across MathSync engines. It is intentionally implementation-free. Its role is to define the expected behavior, interaction standards, and content constraints that future work must follow.

The central direction is simple:

**MathSync must behave like one coherent learning system, not a collection of unrelated mini-games.**

---

## Core Product Decision

MathSync will adopt a shared interaction model across all engines:

**Interact -> deliberate Check -> feedback -> Continue**

This flow is now the default standard for curriculum gameplay. Engines should not auto-grade immediately unless a future exception is explicitly documented.

### Why this is the standard

- It creates consistency across different engines.
- It reduces accidental submissions from young learners.
- It makes the app feel more intentional and polished.
- It supports Duolingo-style pacing without forcing all engines into identical layouts.
- It creates a clear separation between exploration and evaluation.

---

## Global Decisions

### 1. Every engine must use a deliberate Check button

This is a project-wide rule for curriculum gameplay.

- Tracer must use a `Check` action before grading.
- Geoboard must use a `Check` action before grading.
- Numpad-based interactions must use a `Check` action before grading.
- Matcher, Picker, Sort, Drag/Drop, and shape-based engines must use a `Check` action before grading.

### 2. Every question should have a visible pre-evaluation state

Before correctness is shown, the learner should be able to:

- explore the task,
- adjust the answer,
- and submit intentionally.

The app should not rush from interaction into judgment.

### 3. A loading or transition state should exist between questions

MathSync should include a brief, consistent transition before each next question appears.

This is not meant to feel slow. It is meant to create rhythm, reset attention, and keep question changes feeling intentional across engines.

### 4. Result credibility is a hard requirement

The results experience must never display impossible or misleading values.

Examples of unacceptable outcomes:

- impossible accuracy values such as `1000%`,
- unclear scoring labels,
- reward names that are not self-explanatory.

If the learner or teacher does not trust the score, the whole loop weakens.

---

## Engine Decisions

## Tracer Engine

### Decision

Tracer should accept a tracing score in the `80-100` range as correct.

### Rationale

- This preserves challenge while recognizing natural motor variation.
- It avoids punishing learners for near-correct tracing.
- It keeps the engine educational instead of overly strict.

### Additional rule

Tracer must include a deliberate `Check` button before evaluation.

### Visual guidance rule

If tracing is the task, visible tracing guides are part of the core mechanic, not optional decoration. A shape tracer question without a tracing guide is incomplete.

---

## Geoboard Engine

### Decision

Geoboard should not depend primarily on heavily restricted node availability to force a single answer.

### Preferred model

The learner should be allowed to construct a shape, and the engine should validate whether the produced shape satisfies the prompt.

### Example

For a prompt like `Draw a square on the dot board!`, multiple valid square placements may be acceptable if the learning objective is shape construction or recognition.

### Exact-placement exception

If the lesson requires one exact location or orientation, that must be made explicit through:

- wording,
- visual guides,
- or highlighted target zones.

### Anti-pattern to avoid

If only four dots are available and those four dots already force one answer, the activity may become a hidden-path puzzle rather than a shape-construction exercise.

---

## Numpad and Number Entry

### Decision

Not all numeric interactions should reuse the same numpad interface.

### Standard split

- Use the standard numpad for typed numeric answers.
- Use a separate selection-style interaction for prompts such as `Tap the missing number`.

These are different learning actions and should not share identical UI by default.

### Prompt highlighting rule

All important numbers in the question prompt must have a clear visual highlight treatment.

Example:

For `32 + 5`, both `32` and `5` should stand out visually in the prompt and feel connected to any supporting assets or manipulatives.

### Content contract rule

All numpad questions must strictly conform to the supported JSON contract for the engine. If a question requires a different interaction pattern, it should be assigned to a different engine or a specialized numpad variant.

---

## Matcher Engine

### Decision

Matcher should be updated to follow the shared interaction standard and present a clearer staged feedback model.

### Expected behavior direction

- clear selectable states,
- clear matching states,
- a deliberate `Check` action,
- and compact feedback that does not overwhelm the board.

Matcher should feel guided, not ambiguous.

---

## Picker Engine

### Decision

Picker should move toward a column-based pill layout where appropriate.

### Rationale

- easier scanning,
- stronger touch targets,
- cleaner visual rhythm,
- and more consistent readability for Grade 1 learners.

Picker should prioritize legibility and tap confidence over dense layout packing.

---

## Sort Engine

### Decision

Any sort question that does not load completely must be treated as a contract failure between content and engine support.

### Product rule

An engine should only receive questions that it fully supports. Partial rendering is not acceptable behavior.

This is not just a bug category. It is a data-validation and engine-boundary issue.

---

## Drag and Drop

### Decision

Drag-and-drop interactions need a clearer, more intentional UI treatment.

### Direction

Drag targets, draggable items, active states, and drop validity should be visually obvious before evaluation.

The learner should always understand:

- what can be dragged,
- where it can go,
- and what the current state of the board is before tapping `Check`.

---

## Shape Hunt

### Decision

Shape Hunt should be reviewed under the same consistency rules as the other engines.

### Required lens

- clarity of task,
- clarity of selected state,
- deliberate submission,
- and feedback that is visible without wasting space.

---

## Shared UI Decisions

### 1. Remove oversized correctness indicators when they waste layout space

Feedback should be visible, but it should not crowd the play area or compete with the task itself.

### 2. Update badges

Badge visuals should better match the current MathSync direction and feel consistent with the rest of the reward system.

### 3. Update the modal system

Modals should use one visual language across gameplay. Success, retry, transition, and completion moments should feel related rather than custom per engine.

### 4. Update profile design

The profile experience should be brought into the same visual system as the game and progression surfaces. It should not feel like a separate product.

---

## Question Bank Decisions

### Core rule

Question banks must align exactly with engine-supported question formats.

### This means

- no loosely shaped question objects,
- no engine receiving fields it does not understand,
- no question authored for one interaction style but routed into another engine,
- and no unsupported fallback behavior silently patching bad content.

### Authoring principle

If a curriculum question cannot be expressed cleanly through an engine's supported JSON contract, one of two things must happen:

- the question is redesigned to fit the engine, or
- the engine is expanded intentionally with a documented schema update.

Question banks should never guess what an engine might tolerate.

---

## Feedback and Reward Decisions

### Accuracy and scoring

The result engine must display believable, explainable values only.

Accuracy should be mathematically correct and easy to understand.

### Reward naming

`Sun points` must be clarified, renamed, or explicitly explained in the interface.

A child, teacher, or parent should not have to infer what the reward means.

### Design principle

Rewards should reinforce progress, not create confusion.

---

## Priority Decisions

## Priority 1: System consistency

These decisions should guide all future engine updates first:

- universal `Check` button pattern,
- shared question transition/loading state,
- trustworthy result calculations,
- strict content-engine contracts.

## Priority 2: Engine-specific interaction cleanup

- Tracer scoring threshold and guides,
- Geoboard validation model,
- Numpad interaction split,
- Matcher clarity,
- Picker layout update,
- Sort loading reliability,
- drag/drop clarity,
- Shape Hunt consistency.

## Priority 3: Shared visual polish

- badges,
- modal system,
- profile design,
- compact feedback indicators.

---

## Non-Goals of This Document

This document does not define:

- exact component APIs,
- exact JSON field names,
- animation timing,
- implementation sequencing by file,
- or final visual mockups.

Those should be handled in follow-up technical plans once these decisions are accepted.

---

## Final Decision Summary

MathSync should move toward one unified interaction philosophy:

- every engine supports deliberate submission,
- every engine follows a trustworthy evaluation flow,
- every question bank cleanly matches its engine,
- and every feedback surface feels part of one product.

The app should teach through consistency, not through engine-specific exceptions.
