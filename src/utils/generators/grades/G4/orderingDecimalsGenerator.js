import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * orderingDecimalsGenerator.js (Grade 4)
 * Generates decimal sequences (tenths and hundredths) for ordering/comparison.
 * Focuses on Grade 4 mastery: identifying value across different decimal places.
 */

// ============================================================================
// HELPERS
// ============================================================================

const formatDecimal = (val) => {
  return parseFloat(val.toFixed(2)).toString();
};

const generateUniqueDecimals = (count, maxPrecision) => {
  const decimals = new Set();
  
  // Strategy: Mixture of tenths and hundredths
  while (decimals.size < count) {
    let val;
    const type = randomChoice(['tenths', 'hundredths', 'trap']);

    if (type === 'tenths') {
      val = randomInt(0, 9) / 10;
    } else if (type === 'hundredths') {
      val = randomInt(1, 99) / 100;
    } else {
      // Trap: Same digits, different place (e.g., 0.5 vs 0.05)
      const digit = randomInt(1, 9);
      val = randomChoice([digit / 10, digit / 100]);
    }

    decimals.add(val);
  }

  return Array.from(decimals);
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    count = 4,
    direction = randomChoice(['ascending', 'descending']),
    maxPrecision = 2, // 1 for tenths, 2 for hundredths
  } = rules;

  const rawDecimals = generateUniqueDecimals(count, maxPrecision);
  
  // Sort based on direction
  const sortedDecimals = [...rawDecimals].sort((a, b) => {
    return direction === 'ascending' ? a - b : b - a;
  });

  const displaySequence = sortedDecimals.map(formatDecimal);
  const answer = displaySequence.join(', ');

  const displayQuestion = direction === 'ascending'
    ? 'Order these decimals from LEAST to GREATEST.'
    : 'Order these decimals from GREATEST to LEAST.';

  return {
    answer,
    choices: rawDecimals.map(formatDecimal), // Unordered choices for the UI
    metadata: {
      displayQuestion,
      hint: 'Think of 0.5 as 0.50 to make it easier to compare with 0.45!',
      explanation: `To order decimals, compare the digits from left to right. Start with the whole number, then the tenths place, and then the hundredths place. If a place is empty, think of it as a zero (e.g., 0.5 becomes 0.50).`,
      direction,
      correctSequence: displaySequence,
      rawSequence: sortedDecimals,
      category: 'ordering'
    }
  };
};

export default {
  generateProblem
};
