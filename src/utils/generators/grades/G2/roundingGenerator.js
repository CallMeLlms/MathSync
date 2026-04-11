import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers';

/**
 * roundingGenerator.js (Grade 2)
 * Generates rounding problems for nearest 10 and 100.
 */

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

const roundToNearest = (num, base) => Math.round(num / base) * base;

/**
 * Generate distractor choices including distant multiples.
 */
const generateRoundingDistractors = (number, correctAnswer, base) => {
  const choices = new Set();
  choices.add(correctAnswer);

  // Common mistake: round in the wrong direction
  const wrongDirection = (number % base >= base / 2)
    ? Math.floor(number / base) * base
    : Math.ceil(number / base) * base;
  
  if (wrongDirection !== correctAnswer) choices.add(wrongDirection);

  // Add distant multiples
  const offsets = [-2, -1, 1, 2, 3];
  const shuffledOffsets = shuffleArray(offsets);
  
  for (const offset of shuffledOffsets) {
    if (choices.size >= 4) break;
    const distractor = correctAnswer + (offset * base);
    if (distractor >= 0 && distractor !== correctAnswer) {
      choices.add(distractor);
    }
  }

  // Final fillers
  while (choices.size < 4) {
    const randomMultiple = randomInt(0, 10) * base;
    choices.add(randomMultiple);
  }

  return shuffleArray(Array.from(choices));
};

const PROMPTS = {
  round: {
    question: (num, base) => `What is ${num} rounded to the nearest ${base}?`,
    hint: (num, base) => {
        const lastDigit = base === 10 ? num % 10 : num % 100;
        const threshold = base / 2;
        return lastDigit >= threshold 
          ? `The relevant part is ${lastDigit}. Since it's ${threshold} or more, round UP!`
          : `The relevant part is ${lastDigit}. Since it's less than ${threshold}, round DOWN!`;
    }
  }
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    min = 1,
    max = 100,
    roundTo = 10 // options: 10, 100
  } = rules;

  // Ensure we don't pick a number that is already a multiple (too easy)
  let number = randomInt(min, max);
  while (number % roundTo === 0) {
    number = randomInt(min, max);
  }

  const correctAnswer = roundToNearest(number, roundTo);
  const choices = generateRoundingDistractors(number, correctAnswer, roundTo);

  return {
    answer: correctAnswer.toString(),
    choices: choices.map(String),
    direction: roundTo === 10 ? 'nearest-10' : 'nearest-100', // metadata context
    metadata: {
      displayQuestion: PROMPTS.round.question(number, roundTo),
      hint: PROMPTS.round.hint(number, roundTo),
      number,
      roundTo,
      rules
    }
  };
};

export default {
  generateProblem
};
