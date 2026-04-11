import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * meanMedianGenerator.js (Grade 5)
 * Generates problems for calculating Mean (average) and identifying Median (middle value).
 * Standardized for Grade 5 curriculum with clean whole-number results for introductory levels.
 */

// ============================================================================
// HELPERS
// ============================================================================

const generateNumbersWithWholeMean = (count, range) => {
  const numbers = [];
  for (let i = 0; i < count - 1; i++) {
    numbers.push(randomInt(range.min, range.max));
  }

  const currentSum = numbers.reduce((a, b) => a + b, 0);
  // Choose a target mean that results in a valid last number within range
  const minMean = Math.ceil((currentSum + range.min) / count);
  const maxMean = Math.floor((currentSum + range.max) / count);
  
  const targetMean = randomInt(Math.max(range.min, minMean), Math.min(range.max, maxMean));
  const lastNumber = targetMean * count - currentSum;

  numbers.push(lastNumber);
  return shuffleArray(numbers);
};

const generateWrongChoices = (correctAnswer, type, numbers, count) => {
  const sum = numbers.reduce((a, b) => a + b, 0);
  const distractors = new Set();

  if (type === 'mean') {
    distractors.add(sum); // Common mistake: just giving the sum
    distractors.add(count); // Common mistake: giving the number count
    distractors.add(Math.max(...numbers)); // Pick the max
  } else {
    // Median distractors
    distractors.add(sum / count); // Give the mean instead
    distractors.add(Math.min(...numbers)); // Smallest
    distractors.add(Math.max(...numbers)); // Largest
  }

  // Fill remaining slots with off-by-range values
  while (distractors.size < 3) {
    const offset = randomChoice([-2, -1, 1, 2, 5, 10]);
    const val = Math.max(1, Math.round(correctAnswer + offset));
    if (val !== correctAnswer) distractors.add(val);
  }

  return shuffleArray([correctAnswer, ...Array.from(distractors)]);
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

const generateMeanProblem = (rules) => {
  const count = rules.count || 5;
  const range = { min: 2, max: rules.maxValue || 20 };
  
  const numbers = generateNumbersWithWholeMean(count, range);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const answer = sum / count;

  return {
    answer,
    choices: generateWrongChoices(answer, 'mean', numbers, count),
    metadata: {
      displayQuestion: `What is the mean (average) of these numbers: ${numbers.join(', ')}?`,
      hint: `Add all numbers together (${sum}) and then divide by how many there are (${count}).`,
      numbers,
      sum,
      count,
      type: 'mean',
      explanation: `To find the mean, add all the numbers together (${sum}) and then divide by how many there are (${count}). ${sum} ÷ ${count} = ${answer}.`
    }
  };
};

const generateMedianProblem = (rules) => {
  // Force odd count for Grade 5 as per user instructions
  let count = rules.count || 5;
  if (count % 2 === 0) count += 1;
  
  const range = { min: 1, max: rules.maxValue || 50 };
  const numbers = [];
  while (numbers.length < count) {
    const num = randomInt(range.min, range.max);
    if (!numbers.includes(num)) numbers.push(num);
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const answer = sorted[Math.floor(count / 2)];

  return {
    answer,
    choices: generateWrongChoices(answer, 'median', numbers, count),
    metadata: {
      displayQuestion: `Find the median of this data set: ${numbers.join(', ')}`,
      hint: `First, order the numbers from least to greatest. The median is the middle number!`,
      numbers,
      sortedSequence: sorted,
      type: 'median',
      explanation: `To find the median, first put the numbers in order: ${sorted.join(', ')}. The median is the middle number in the sorted list, which is ${answer}.`
    }
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const type = rules.type || randomChoice(['mean', 'median']);

  switch (type) {
    case 'median':
      return generateMedianProblem(rules);
    case 'mean':
    default:
      return generateMeanProblem(rules);
  }
};

export default {
  generateProblem
};
