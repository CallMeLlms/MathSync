import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * orderingNumberGenerator.js (Grade 2)
 * Generates number sequence problems for Grade 2 students.
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
    'Put these in order: smallest to biggest!',
    'Arrange from smallest to largest!',
    'Order these numbers: low to high!',
  ],
  descending: [
    'Put these in order: biggest to smallest!',
    'Arrange from largest to smallest!',
    'Order these numbers: high to low!',
  ],
};

/**
 * Generate a single ordering problem for Grade 2
 */
export const generateProblem = (rules = {}) => {
  const {
    count = 5,
    min = 1,
    max = 100,
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
    answer: correctOrder.join(', '),
    choices: scrambled.map(String),
    metadata: {
      displayQuestion: randomChoice(PROMPTS[direction]),
      hint: `The ${direction === 'ascending' ? 'smallest' : 'largest'} number comes first!`,
      explanation: `To order numbers, compare the digits starting from the highest place value. For ${direction} order, look for the ${direction === 'ascending' ? 'smallest' : 'largest'} number first.`,
      grade: 2,
      type: 'ordering-numbers',
      correctOrder,
      rules
    }
  };
};

export default {
  generateProblem
};
