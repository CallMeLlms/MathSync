import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * multiplicationGenerator.js (Grade 3)
 * Pure multiplication brain focused on factor/product sets up to 12.
 */

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Ensures a unique set of choices
 */
const finalizeChoices = (answer, distractors, count = 4) => {
  const choices = new Set();
  choices.add(answer.toString());
  
  distractors.forEach(d => {
    if (choices.size < count) choices.add(d.toString());
  });
  
  while (choices.size < count) {
    const fallback = randomInt(1, 144).toString();
    choices.add(fallback);
  }
  
  return shuffleArray(Array.from(choices));
};

const PROMPTS = {
  question: (a, b) => `${a} × ${b} = ?`,
  hint: () => `Multiplication is repeated addition. For example, 3 × 4 is the same as 4 + 4 + 4.`
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    minFactor = 1,
    maxFactor = 12,
    avoidZero = true
  } = rules;

  const a = avoidZero ? randomInt(Math.max(1, minFactor), maxFactor) : randomInt(minFactor, maxFactor);
  const b = avoidZero ? randomInt(Math.max(1, minFactor), maxFactor) : randomInt(minFactor, maxFactor);
  
  const answer = a * b;

  // Generate plausible distractors
  const distractors = [
    (a + 1) * b,             // Neighbor factor
    a * (b + 1),             // Neighbor factor
    (a - 1) * b,             // Neighbor factor (lower)
    a + b,                   // Common mistake (adding instead of multiplying)
    Math.abs(answer - randomChoice([1, 2, 5, 10])), // Close numbers
    randomInt(1, maxFactor * maxFactor) // Random spread
  ].filter(d => d >= 0 && d !== answer);

  return {
    answer: answer.toString(),
    choices: finalizeChoices(answer, distractors),
    metadata: {
      displayQuestion: PROMPTS.question(a, b),
      hint: PROMPTS.hint(),
      operand1: a,
      operand2: b,
      rules,
      explanation: `Multiplication is the process of adding the same number multiple times. ${a} × ${b} means adding ${a} to itself ${b} times (or vice versa), which totals ${answer}.`
    }
  };
};

export default {
  generateProblem
};