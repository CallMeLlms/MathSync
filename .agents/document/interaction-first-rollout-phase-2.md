Ready for review
Select text to add comments on the plan
Plan: Interaction-First Rollout — Phase 2 (Content Audit + Engine Strengthening)
Context
MVP validated: SHAPE_HUNT + COMPOSE_DRAG confirmed. The approach works.

Before migrating more JSON, we need to answer a harder question first: Is the content distribution itself wrong?

The Bias Problem
Current type distribution:

Type	Count	%
NUMPAD	80	40%
PICKER	38	19%
MATCHER	22	11%
SORT	15	7.5%
All gesture/visual engines	~30	15%
Everything else	~15	7.5%
NUMPAD + PICKER = 59% of all questions. Both produce a number or read text. For Grade 1 — which covers shapes, measurement, data, patterns, money, time — this is too heavy. The bias exists because numeric engine schemas are trivially simple to author, not because the content demands it.

🚨 NUMPAD Is Doing Three Cognitive Jobs
After reading both NumpadEngine and VisualNumpadEngine, the situation is:

Job	Current Engine	Is it right?
Pure arithmetic recall: "What is 5 + 3?"	NUMPAD	✅ Correct
Concrete counting: "3 apples + 4 apples = ?" (see the tiles)	VISUAL_NUMPAD	✅ Correct — it shows tile groups
Symbolic / sequence: "2, 4, __, 8 — what's the missing number?"	NUMPAD ❌	Wrong. NUMPAD shows no sequence context. VISUAL_NUMPAD shows tile groups, not sequences. No engine currently serves this correctly.
VISUAL_NUMPAD's visual zone shows tile groups for counting (3 red + 4 blue blocks). It cannot display a horizontal sequence like 2 → 4 → ? → 8. So routing symbolic/pattern questions to VISUAL_NUMPAD would be wrong.

Decision Framework: When to Create a New Engine
Create a new engine when the INPUT AFFORDANCE is fundamentally different, OR when the visual context needed to support reasoning cannot be added to an existing engine without distorting its original purpose.

Scenario	Decision	Why
Arithmetic ("5 + 3 = ?") → type number	NUMPAD ✅	Pure recall, no context needed
Concrete counting ("3 + 4 tiles") → type number	VISUAL_NUMPAD ✅	Tile group display serves counting
Sequence / missing number ("2, 4, __, 8") → type number	Extend VISUAL_NUMPAD	Add a sequence display mode — same affordance, different visual zone
Non-numeric patterns (ABAB shape patterns) → tap next element	PICKER (visual tiles) or new	Input is a tap, not a number
Shape identification → tap correct shape	SHAPE_HUNT ✅	Already exists
Ordering → drag to sort	SORT ✅	Already exists
Construction / composing → tap to place	COMPOSE_DRAG ✅	Already exists
Do not create a new engine for numeric sequences. Extend VISUAL_NUMPAD with a sequence mode. The affordance (type a number) is identical. What changes is the display zone.

The Real Fix: 3 Moves
Move 1 — Extend VISUAL_NUMPAD with a sequence display mode
Add a new rendering path inside VisualNumpadEngine.jsx:

metadata: { sequence: [2, 4, null, 8] }
The visual card renders a horizontal row of boxes. Non-null values show the number. The null slot shows a pulsing dashed box (the blank). This is a UI addition — no schema changes to other files, no new orchestrator case.

Schema example:

{
  "type": "VISUAL_NUMPAD",
  "question": "What number comes next?",
  "answer": 6,
  "maxDigits": 1,
  "metadata": { "sequence": [2, 4, null, 8] }
}
Move 2 — Make existing engines domain-agnostic
These three engines currently feel "shape-only" or "number-only" but their schemas are general enough to work across all Grade 1 domains:

SHAPE_HUNT — tap to select matching items

Can hunt coins ("Tap all the 1-peso coins")
Can hunt fractions ("Tap all shapes showing one half")
Can hunt clocks ("Tap the clock showing 3:00")
Engine code unchanged. Just needs money/fraction/clock assets in assetMap.js and new question banks.
MATCHER — connect matching pairs

Can match clock → time text
Can match fraction image → fraction notation
Can match ordinal word → position illustration
Engine may need a UI tweak if it currently only supports text labels on both sides.
COMPOSE_DRAG — tap to place correct pieces into target

Can compose a number from tens/ones blocks ("Make 24")
Can build a repeating pattern by placing elements ("Continue ABAB")
Engine unchanged. Needs new asset types registered.
Move 3 — Content audit and reclassification
NUMPAD questions — classify each:
Keep NUMPAD: pure arithmetic recall ("5 + 3 = ?")
→ VISUAL_NUMPAD (tile mode): concrete counting with visual groups
→ VISUAL_NUMPAD (sequence mode): missing number, skip counting patterns
→ SORT: "arrange from smallest to largest" disguised as number input
PICKER questions — classify each (3 routes):
Route A → NUMPAD: answer is a number, distractors are numbers
Route B → SHAPE_HUNT: answer is a visual item (shape, coin, clock, fraction image)
Route C → keep PICKER (visual tile UI): abstract/vocabulary, no visual equivalent exists
Target Distribution (after this sprint)
Type	Target %	Why
NUMPAD	~20%	Arithmetic only — pure recall/compute
VISUAL_NUMPAD	~15%	Counting (tile mode) + sequences (sequence mode)
SHAPE_HUNT	~15%	Recognition tasks across ALL domains
MATCHER	~12%	Relational thinking across ALL domains
SORT	~10%	Ordering tasks
COMPOSE_DRAG	~10%	Construction thinking
Gesture engines (SHAPETRACER, GEOBOARD, CONNECTDOTS)	~8%	Fine motor / spatial
PICKER (Route C visual tiles only)	~5%	Genuine multiple-choice, no visual equivalent
WORD_PROBLEM	~5%	Contextual story problems
Files to Change
Step 1 — Audit NUMPAD questions (read-only, classify only)
Read all banks containing NUMPAD questions. For each, decide: keep NUMPAD / → VISUAL_NUMPAD tile mode / → VISUAL_NUMPAD sequence mode / → SORT. Do not change anything yet — produce a classification list.

Step 2 — Audit PICKER questions (read-only, classify only)
Read all banks containing PICKER questions. For each, classify Route A / B / C. Produce a classification list.

Step 3 — Extend VISUAL_NUMPAD with sequence mode
In VisualNumpadEngine.jsx, add a sequence rendering path inside renderVisualZone():

If metadata.sequence is an array → render a horizontal row of number cards
null values → dashed pulsing blank box
Non-null values → solid card with the number displayed
No other engine changes. No orchestrator changes. No new case.
Step 4 — Migrate misclassified NUMPAD questions
Apply the classification from Step 1:

NUMPAD → VISUAL_NUMPAD (sequence): change type, add metadata.sequence array
NUMPAD → VISUAL_NUMPAD (tile): change type, add metadata.addends or metadata.count
NUMPAD → SORT: change type, restructure items and answer arrays
Step 5 — Migrate PICKER → SHAPE_HUNT (Route B)
For each Route B question:

"type": "PICKER" → "type": "SHAPE_HUNT"
Rename "question" → "prompt"
Remove "metadata": { "options": [...] }
Add "items" array with isTarget: true/false per item
Register any new non-shape assets in assetMap.js
Step 6 — Migrate PICKER → NUMPAD (Route A)
For each Route A question:

"type": "PICKER" → "type": "NUMPAD"
Remove "metadata": { "options": [...] }
Keep "question" and "answer", add "maxDigits"
Step 7 — Upgrade PickerEngine.jsx (Route C only, visual tile layout)
Read the current engine. Replace text-list option rows with a 2×2 grid of large tap tiles. Correct tap: green border + checkmark, auto-advance 600ms. Wrong tap: red flash, no penalty. Keep { data, onResult } contract.

Step 8 — Spot-check affected nodes
Play through Nodes 1, 2, 3, 4 — the nodes most affected. Verify:

Sequence questions render the new visual sequence zone correctly
Route B questions render as SHAPE_HUNT correctly
Route C PICKER renders with the new tile UI
What Is NOT Touched
SORT, COMPOSER, SHAPETRACER, GEOBOARD, CONNECTDOTS, ORDINAL_SEQUENCE banks
WORD_PROBLEM — 4 questions, dedicated engine, leave for later
MATCHER — content audit for MATCHER is Phase 3
lessonResolver.js — no structural changes
Generative stack (G2–G6)
Engine Creation Rule (to enforce going forward)
Create a new engine when: (a) the physical input the learner uses is different, OR (b) the visual context required to reason cannot be added to an existing engine without distorting its purpose.

Never create an engine because: a new topic arrives, a question count is high, or authoring an existing engine's schema is harder.

After This Sprint
PICKER eliminated as text-Q&A. NUMPAD correctly split between arithmetic (NUMPAD) and counting/sequences (VISUAL_NUMPAD). SHAPE_HUNT ready to cover money, fractions, and time domains with new asset registrations.

Phase 3: MATCHER content upgrade (relational thinking across all domains) + new question banks for money, fractions, and time nodes authored against the generalized engines.