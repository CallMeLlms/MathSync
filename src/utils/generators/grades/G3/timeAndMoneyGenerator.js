import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * timeAndMoneyGenerator.js (Grade 3)
 * Generates coin counting problems with unique choices and pedagogical metadata.
 */

// ============================================================================
// COIN DATA
// ============================================================================

const COINS = {
  quarters: { label: 'Quarter', value: 25, color: '#FFD700' },
  dimes:    { label: 'Dime',    value: 10, color: '#C0C0C0' },
  nickels:  { label: 'Nickel',  value: 5,  color: '#B8C4C9' },
  pennies:  { label: 'Penny',   value: 1,  color: '#CD7F32' },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formats cents as a dollar string (e.g., "$1.25")
 */
const formatCents = (cents) => {
  const dollars = Math.floor(cents / 100);
  const remaining = cents % 100;
  return `$${dollars}.${remaining.toString().padStart(2, '0')}`;
};

/**
 * Generates plausible distractors for money problems
 */
const generateWrongChoices = (correctCents, count = 3) => {
  const wrongChoices = new Set();
  const offsets = [5, 10, 15, 25, -5, -10, -15, -25, 50, -50, 1, -1];

  while (wrongChoices.size < count) {
    const offset = randomChoice(offsets);
    const wrongCents = correctCents + offset;

    if (wrongCents > 0) {
      const choice = formatCents(wrongCents);
      if (choice !== formatCents(correctCents)) {
        wrongChoices.add(choice);
      }
    }
  }

  return Array.from(wrongChoices);
};

const PROMPTS = {
  questions: [
    'How much money is shown?',
    'Count the coins. What is the total?',
    'What is the total value of these coins?',
  ],
  hint: 'Count the coins with the highest value first (Quarters) and then add the smaller coins.'
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    coinTypes = ['quarters', 'dimes', 'nickels', 'pennies'],
    maxCents = 300
  } = rules;

  const coins = { quarters: 0, dimes: 0, nickels: 0, pennies: 0 };
  let totalCents = 0;

  // Generate a valid coin set
  let attempts = 0;
  while ((totalCents === 0 || totalCents > maxCents) && attempts < 50) {
    attempts++;
    totalCents = 0;
    coinTypes.forEach(type => {
      const maxCount = type === 'quarters' ? 8 : 10;
      const count = randomInt(0, maxCount);
      coins[type] = count;
      totalCents += count * COINS[type].value;
    });
  }

  // Ensure at least one coin if we failed to randomize effectively
  if (totalCents === 0 || totalCents > maxCents) {
    const defaultType = randomChoice(coinTypes);
    coins[defaultType] = randomInt(1, 4);
    totalCents = coins[defaultType] * COINS[defaultType].value;
  }

  const correctAnswer = formatCents(totalCents);
  const choices = shuffleArray([correctAnswer, ...generateWrongChoices(totalCents)]);

  return {
    answer: correctAnswer,
    choices,
    metadata: {
      displayQuestion: randomChoice(PROMPTS.questions),
      hint: PROMPTS.hint,
      coinBreakdown: coins,
      rules,
      explanation: `To find the total value, count the coins by their denominations. For example, 2 quarters are 50 cents, 1 dime is 10 cents, and 2 nickels are 10 cents. Total: 50 + 10 + 10 = 70 cents.`
    }
  };
};

export default {
  generateProblem
};
