import { generateProblem as arithmeticGenerateProblem } from './arithmeticGenerator';

/**
 * mentalMathGenerator.js
 * Difficulty-aware wrapper around arithmeticGenerator for the Mental Math feature.
 * Maps easy/medium/hard tiers to arithmetic rule sets.
 */

const DIFFICULTY_RULES = {
  easy: {
    operations: ['addition', 'subtraction'],
    min: 1,
    max: 20,
    maxFactor: 10,
  },
  medium: {
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    min: 1,
    max: 50,
    maxFactor: 9,
  },
  hard: {
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    min: 1,
    max: 100,
    maxFactor: 12,
  },
};

export const generateProblem = (rules = {}) => {
  const { difficulty = 'medium', operations } = rules;
  const base = DIFFICULTY_RULES[difficulty] || DIFFICULTY_RULES.medium;

  const merged = {
    ...base,
    // User-selected operation filter overrides the difficulty default when provided
    ...(operations && operations.length > 0 ? { operations } : {}),
  };

  console.log('[mentalMathGenerator] generating — merged rules:', JSON.stringify(merged));
  return arithmeticGenerateProblem(merged);
};

export default { generateProblem };
