import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * algebraGenerator.js (Grade 6)
 * Generates one-step and two-step algebraic equations.
 * Focuses on isolating variables through inverse operations with clean whole-number solutions.
 *
 * Output shape:
 *   { answer, choices, metadata }
 *
 * metadata includes:
 *   - displayQuestion  — human-readable prompt string
 *   - hint             — pedagogical hint string
 *   - explanation       — step-by-step solution string
 *   - variable         — the letter used (e.g. 'x')
 *   - equation         — raw equation string (legacy)
 *   - type             — 'oneStep' | 'twoStep'
 *   - equationParts    — { left: string[], right: string[], variable: string }
 *                        where '?' marks the variable slot
 *   - scrollRange      — { min: number, max: number } for the scroll strip
 */

// ============================================================================
// DATA & HELPERS
// ============================================================================

const CURATED_VARIABLES = ['x', 'y', 'n', 'a', 'b', 'k'];

const generateWrongChoices = (correctAnswer, range) => {
  const distractors = new Set();

  const strategies = [
    () => correctAnswer + 1,
    () => correctAnswer - 1,
    () => correctAnswer + randomInt(2, 5),
    () => correctAnswer - randomInt(2, 5),
    () => Math.round(correctAnswer * 2),
    () => Math.round(correctAnswer / 2),
    () => randomInt(range.min, range.max)
  ];

  while (distractors.size < 3) {
    const val = strategies[randomInt(0, strategies.length - 1)]();
    if (val !== correctAnswer && Number.isInteger(val) && val >= 1) {
      distractors.add(val);
    }
  }

  return shuffleArray([correctAnswer, ...Array.from(distractors)]);
};

/**
 * Builds the scrollRange ensuring the correct answer is always reachable.
 * Pads by a random offset so the answer isn't always dead-center.
 */
const buildScrollRange = (answer, maxVal) => {
  const padding = randomInt(3, 7);
  const min = Math.max(1, answer - padding);
  const max = Math.max(answer + padding, maxVal);
  return { min, max };
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

const generateOneStepProblem = (rules, v) => {
  const operation = rules.operation || randomChoice(['addition', 'subtraction', 'multiplication', 'division']);
  const range = { min: 1, max: rules.maxValue || 20 };

  const a = randomInt(range.min, Math.round(range.max / 2));
  const answer = randomInt(range.min, Math.round(range.max / 2));
  let equation = '';
  let hint = '';
  let explanation = '';
  let equationParts = { left: [], right: [], variable: v };

  switch (operation) {
    case 'subtraction': {
      const b = answer - a; // x - a = b
      if (b < 1) { // Fallback if result is negative
        const sum = answer + a;
        equation = `${v} - ${a} = ${answer}`;
        hint = `Try adding ${a} to both sides to find ${v}.`;
        explanation = `${v} - ${a} = ${answer}\n${v} = ${answer} + ${a}\n${v} = ${answer + a}`;
        equationParts = { left: ['?', '−', String(a)], right: [String(answer)], variable: v };
        return { answer: answer + a, equation, hint, explanation, equationParts };
      }
      equation = `${v} - ${a} = ${b}`;
      hint = `Try adding ${a} to both sides to find ${v}.`;
      explanation = `${v} - ${a} = ${b}\n${v} = ${b} + ${a}\n${v} = ${answer}`;
      equationParts = { left: ['?', '−', String(a)], right: [String(b)], variable: v };
      break;
    }
    case 'multiplication': {
      const b = a * answer;
      equation = `${a}${v} = ${b}`;
      hint = `Try dividing both sides by ${a} to find ${v}.`;
      explanation = `${a}${v} = ${b}\n${v} = ${b} ÷ ${a}\n${v} = ${answer}`;
      equationParts = { left: [String(a) + '·', '?'], right: [String(b)], variable: v };
      break;
    }
    case 'division': {
      // x / a = answer  →  x = a * answer
      const divisor = randomInt(2, 8);
      const quotient = randomInt(2, 10);
      const dividend = divisor * quotient; // always clean integer
      equation = `${v} ÷ ${divisor} = ${quotient}`;
      hint = `Try multiplying both sides by ${divisor} to find ${v}.`;
      explanation = `${v} ÷ ${divisor} = ${quotient}\n${v} = ${quotient} × ${divisor}\n${v} = ${dividend}`;
      equationParts = { left: ['?', '÷', String(divisor)], right: [String(quotient)], variable: v };
      return { answer: dividend, equation, hint, explanation, equationParts };
    }
    case 'addition':
    default: {
      const b = answer + a;
      equation = `${v} + ${a} = ${b}`;
      hint = `Try subtracting ${a} from both sides to find ${v}.`;
      explanation = `${v} + ${a} = ${b}\n${v} = ${b} - ${a}\n${v} = ${answer}`;
      equationParts = { left: ['?', '+', String(a)], right: [String(b)], variable: v };
      break;
    }
  }

  return { answer, equation, hint, explanation, equationParts };
};

const generateTwoStepProblem = (rules, v) => {
  const a = randomInt(2, 5); // coefficient
  const answer = randomInt(1, 10);
  const b = randomInt(1, 15); // constant
  const isAddition = randomChoice([true, false]);

  let equation = '';
  let hint = 'Isolate the variable term first, then divide by the coefficient.';
  let explanation = '';
  let equationParts = { left: [], right: [], variable: v };
  let c;

  if (isAddition) {
    c = a * answer + b;
    equation = `${a}${v} + ${b} = ${c}`;
    explanation = `${equation}\nStep 1: Subtract ${b} from both sides\n${a}${v} = ${c - b}\nStep 2: Divide both sides by ${a}\n${v} = ${answer}`;
    equationParts = { left: [String(a) + '·', '?', '+', String(b)], right: [String(c)], variable: v };
  } else {
    c = a * answer - b;
    if (c < 1) { // Fallback to avoid confusing negatives in G6 start
      c = a * answer + b;
      equation = `${a}${v} + ${b} = ${c}`;
      explanation = `${equation}\nStep 1: Subtract ${b} from both sides\n${a}${v} = ${c - b}\nStep 2: Divide both sides by ${a}\n${v} = ${answer}`;
      equationParts = { left: [String(a) + '·', '?', '+', String(b)], right: [String(c)], variable: v };
    } else {
      equation = `${a}${v} - ${b} = ${c}`;
      explanation = `${equation}\nStep 1: Add ${b} to both sides\n${a}${v} = ${c + b}\nStep 2: Divide both sides by ${a}\n${v} = ${answer}`;
      equationParts = { left: [String(a) + '·', '?', '−', String(b)], right: [String(c)], variable: v };
    }
  }

  return { answer, equation, hint, explanation, equationParts };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const v = rules.variable || randomChoice(CURATED_VARIABLES);
  const type = rules.type || randomChoice(['oneStep', 'twoStep']);
  const maxVal = rules.maxValue || 20;

  let result;
  if (type === 'twoStep') {
    result = generateTwoStepProblem(rules, v);
  } else {
    result = generateOneStepProblem(rules, v);
  }

  const scrollRange = buildScrollRange(result.answer, maxVal);

  return {
    answer: result.answer,
    choices: generateWrongChoices(result.answer, { min: 1, max: maxVal * 2 }),
    metadata: {
      displayQuestion: `Solve for ${v}`,
      hint: result.hint,
      explanation: result.explanation,
      variable: v,
      equation: result.equation,
      type,
      equationParts: result.equationParts,
      scrollRange
    }
  };
};

export default {
  generateProblem
};
