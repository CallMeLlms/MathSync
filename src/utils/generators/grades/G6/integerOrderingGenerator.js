import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers';

/**
 * integerOrderingGenerator.js (Grade 6)
 * Generates integer ordering problems (including negative numbers).
 * Removed internal difficulty scaling; now accepts rules.
 */

/**
 * Generate unique random numbers within a range
 */
const generateUniqueNumbers = (count, min, max) => {
  const numbers = new Set();
  const range = max - min + 1;
  const actualCount = Math.min(count, range);

  while (numbers.size < actualCount) {
    numbers.add(randomInt(min, max));
  }

  return Array.from(numbers);
};

/**
 * Shuffle until the result is different from the sorted order
 */
const shuffleUntilDifferent = (numbers, sortedOrder) => {
  let shuffled = shuffleArray(numbers);
  let attempts = 0;

  const isDuplicate = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  while (isDuplicate(shuffled, sortedOrder) && attempts < 10) {
    shuffled = shuffleArray(numbers);
    attempts++;
  }

  return shuffled;
};

const PROMPTS = {
  ascending: [
    'Order these integers: smallest to largest!',
    'Arrange from least to greatest!',
    'Sort these integers in ascending order!',
  ],
  descending: [
    'Order these integers: largest to smallest!',
    'Arrange from greatest to least!',
    'Sort these integers in descending order!',
  ],
};

/**
 * Generate a single integer ordering problem
 */
export const generateProblem = (rules = {}) => {
  const {
    count = 6,
    min = -50,
    max = 50,
    directions = ['ascending', 'descending']
  } = rules;

  const direction = randomChoice(directions);

  const numbers = generateUniqueNumbers(count, min, max);

  const correctOrder = [...numbers].sort((a, b) =>
    direction === 'ascending' ? a - b : b - a
  );

  const scrambled = shuffleUntilDifferent(numbers, correctOrder);

  return {
    numbers: scrambled,
    correctOrder,
    direction,
    metadata: {
      displayQuestion: randomChoice(PROMPTS[direction]),
      grade: 6,
      type: 'integer-ordering',
      rules
    }
  };
};

export default {
  generateProblem
};
