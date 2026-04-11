# MathSync Generative Engine Guidelines

## 1. Philosophy: Brain-First Architecture

MathSync utilizes a **Brain-First** approach to problem generation. The "Brain" (Generator) is a pure logic provider that has no knowledge of the UI, React components, or session state.

### Core Principles:
- **Decoupling**: The Brain provides the math; the UI provides the interaction.
- **Rule-Based**: Generators must be fully parameterizable via a `rules` object.
- **Deterministic Validity**: Logic must ensure that every generated problem is solvable with integer intermediate steps where appropriate (e.g., PEMDAS).
- **Metadata Rich**: The Brain provides all pedagogical context (Hints, Explanations, Reactive Feedback) so the UI remains "dumb."

---

## 2. Technical Standards

### Module Format
- **Strict JavaScript (ESM)**: No TypeScript syntax (`interfaces`, `types`, `enums`) inside the generator files. This ensures high-speed execution and compatibility with simple verification scripts.
- **Path Aliases**: Avoid relative paths like `../../../`. Use the project-standard aliases defined in `jsconfig.json`.
- **Statelessness**: Generators must be pure functions. Do not store session data or global counters inside the brain.

### File Location
Generators are organized by grade and category:
- `src/utils/generators/core/`: Common math helpers (`randomInt`, `shuffleArray`).
- `src/utils/generators/common/`: Shared arithmetic logic used across multiple grades.
- `src/utils/generators/grades/G[X]/`: Grade-specific specialized brains.

---

## 3. The `generateProblem(rules)` Interface

Everyized modernized generator MUST export a `generateProblem` function (and a default export containing it).

### Input: `rules` Object
Always provide defaults for rules so the generator can run without configuration.
```javascript
export const generateProblem = (rules = {}) => {
  const type = rules.type || "random";
  const maxValue = rules.maxValue || 100;
  // ... logic
};
```

### Output: Standard Problem Object
The function must return a standardized object containing:
- `answer`: The raw numerical or string result.
- `choices`: An array of shuffled multi-choice options (including the answer).
- `metadata`: An object containing all context-specific data.

---

## 4. Metadata Specification

Metadata is where the "educational value" of MathSync resides.

| Field | Purpose | Example |
| :--- | :--- | :--- |
| `displayQuestion` | The primary prompt for the student. | "Which number is Prime?" |
| `hint` | A concept-level tip shown on-demand. | "Primes only have 2 factors." |
| `explanation` | A multi-step breakdown of the solution. | "Step 1: Subtract 5..." |
| `reactiveHints` | Feedback triggered by specific wrong actions. | "Multiplication comes before Addition!" |
| `type` | The specific sub-generator used. | `twoStep` |

### Specialized Game Metadata
- **Matching Games**: Return raw pairs in `metadata.pairs`. Let the UI handle the shuffling/splitting.
- **Grid Games**: Return `correctIndices` map for UI selection verification.
- **Ordering Games**: Return the `correctSequence` or `sortedNumbers`.

---

## 5. Implementation Workflow: The "Golden Path"

### Step 1: Answer-First Generation
To ensure clean math, pick the **result** first, then build the expression around it.
- **Incorrect**: Generate `32 ÷ 7` -> Decimal error.
- **Correct**: Pick `answer = 4`, then `divisor = 8`, then `dividend = 32`. Equation: `32 ÷ 8 = 4`.

### Step 2: Operational Traps (Distractor Strategy)
Distractors should never be truly random. They should catch common student errors:
- **Operational Traps**: Student adds instead of subtracting.
- **Neighbor Traps**: Answer ± 1 or ± 10.
- **Conceptual Traps**: Confusing shaded with unshaded in percentages.

### Step 3: Division and Subtraction Safety
- **Subtraction**: Always ensure `a >= b` for Grade 1-3 to avoid negative numbers unless specified.
- **Division**: Always ensure `remainder === 0`. Use the compatible-number strategy.

---

## 6. Verification & Testing

Every generator should have a corresponding verification script in the `scratch/` directory:
1. Create `verify_[generator_name].mjs`.
2. Import the generator using the `file:///` absolute path.
3. Run 20+ iterations to check for:
   - Floating point issues.
   - Non-integer division.
   - Duplicate choices.
   - Undefined metadata fields.

---
_MathSync Engineering Standard - v1.0.0_
