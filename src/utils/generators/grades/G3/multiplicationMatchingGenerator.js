import { randomInt, shuffleArray } from '../../core/mathHelpers.js';

/**
 * multiplicationMatchingGenerator.js (Grade 3)
 * Generates a set of unique multiplication fact pairs for matching games.
 */

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generates mathematically unique pairs (unique equations and unique answers)
 */
const generateUniquePairs = (count, min, max) => {
  const pairs = [];
  const usedAnswers = new Set();
  const usedEquations = new Set();
  
  let attempts = 0;
  const maxAttempts = count * 20;

  while (pairs.length < count && attempts < maxAttempts) {
    attempts++;
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    const answer = a * b;
    
    // Create a canonical key for the equation (e.g., "3x4")
    const eqKey = `${Math.min(a, b)}x${Math.max(a, b)}`;

    // Skip trivial 1x1, duplicate answers, or duplicate equations
    if ((a === 1 && b === 1) || usedAnswers.has(answer) || usedEquations.has(eqKey)) {
      continue;
    }

    pairs.push({
      question: `${a} × ${b}`,
      answer: answer.toString()
    });

    usedAnswers.add(answer);
    usedEquations.add(eqKey);
  }

  return pairs;
};

const PROMPTS = {
  question: 'Match the multiplication equations to their correct answers.',
  hint: 'Pick an equation like "3 × 4" and find its total!'
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    pairCount = 6,
    minFactor = 1,
    maxFactor = 12
  } = rules;

  const pairs = generateUniquePairs(pairCount, minFactor, maxFactor);

  return {
    answer: `${pairs.length} pairs matched`, // Metadata-level goal
    metadata: {
      displayQuestion: PROMPTS.question,
      hint: PROMPTS.hint,
      pairs, // The raw matched pairs for the UI to split/shuffle
      rules,
      explanation: 'In this matching game, find the total for each multiplication fact to make a pair.'
    },
    choices: [] // Matching games don't use standard choices
  };
};

export default {
  generateProblem
};
