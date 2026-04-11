import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * percentagesGenerator.js (Grade 5)
 * Generates percentage problems (Identify, Calculate, Convert).
 * Standardized for Grade 5 with focusing on friendly fractions and clean whole-number results.
 */

// ============================================================================
// DATA & HELPERS
// ============================================================================

const FRIENDLY_FRACTIONS = [
  { n: 1, d: 2, p: 50 },
  { n: 1, d: 4, p: 25 },
  { n: 3, d: 4, p: 75 },
  { n: 1, d: 5, p: 20 },
  { n: 2, d: 5, p: 40 },
  { n: 3, d: 5, p: 60 },
  { n: 4, d: 5, p: 80 },
  { n: 1, d: 10, p: 10 },
  { n: 3, d: 10, p: 30 },
  { n: 7, d: 10, p: 70 },
  { n: 9, d: 10, p: 90 },
];

const PERCENTAGES = [10, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100];

/**
 * Finds a base number that ensures (percentage/100 * base) is an integer.
 */
const findCompatibleBaseNumber = (percentage, maxBase = 100) => {
  const simplifiedDenom = 100 / ( (a, b) => {
    while (b) { a %= b; [a, b] = [b, a]; }
    return a;
  } )(percentage, 100);
  
  const multiples = [];
  for (let i = simplifiedDenom; i <= maxBase; i += simplifiedDenom) {
    multiples.push(i);
  }
  return randomChoice(multiples.length > 0 ? multiples : [100]);
};

const generateWrongChoices = (correctAnswer, type) => {
  const distractors = new Set();
  const format = (v) => type === 'calculate' ? v.toString() : `${v}%`;
  const correctStr = format(correctAnswer);

  const strategies = [
    () => correctAnswer + 5,
    () => correctAnswer - 5,
    () => 100 - correctAnswer, // Complement
    () => correctAnswer * 2,
    () => Math.round(correctAnswer / 2),
    () => randomChoice([10, 20, 25, 50, 75])
  ];

  while (distractors.size < 3) {
    const val = strategies[randomInt(0, strategies.length - 1)]();
    const str = format(val);
    if (str !== correctStr && val > 0 && val <= 500) {
      distractors.add(str);
    }
  }

  return shuffleArray([correctStr, ...Array.from(distractors)]);
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

const generateIdentifyProblem = (rules) => {
  const percentage = randomChoice([10, 20, 25, 30, 40, 50, 60, 75, 80]);
  const answer = `${percentage}%`;

  return {
    answer,
    choices: generateWrongChoices(percentage, 'identify'),
    metadata: {
      displayQuestion: "What percentage is shaded?",
      hint: `Think of the grid as 100 equal parts. How many are colored?`,
      percentage,
      type: 'identify',
      explanation: `To find the percentage, count how many squares are shaded out of 100. ${percentage} squares shaded means it is ${percentage}%.`
    }
  };
};

const generateCalculateProblem = (rules) => {
  const percentage = randomChoice(PERCENTAGES);
  const baseNumber = findCompatibleBaseNumber(percentage, rules.maxValue || 200);
  const answerValue = (percentage / 100) * baseNumber;
  
  const answer = answerValue.toString();

  return {
    answer,
    choices: generateWrongChoices(answerValue, 'calculate'),
    metadata: {
      displayQuestion: `What is ${percentage}% of ${baseNumber}?`,
      hint: `Recall that ${percentage}% is the same as ${percentage}/100.`,
      percentage,
      baseNumber,
      rules,
      explanation: `To find a percentage of a number, divide the percentage by 100 to get a decimal, then multiply by the number. For example, ${percentage}% of ${baseNumber} is (${percentage} ÷ 100) × ${baseNumber} = ${answerValue}.`,
      result: answerValue,
      type: 'calculate'
    }
  };
};

const generateConvertProblem = (rules) => {
  const selected = randomChoice(FRIENDLY_FRACTIONS);
  const answer = `${selected.p}%`;

  return {
    answer,
    choices: generateWrongChoices(selected.p, 'convert'),
    metadata: {
      displayQuestion: `Convert the fraction ${selected.n}/${selected.d} to a percentage.`,
      hint: `Try to find an equivalent fraction with 100 as the denominator!`,
      fraction: { numerator: selected.n, denominator: selected.d },
      percentage: selected.p,
      type: 'convert',
      explanation: `To convert ${selected.n}/${selected.d} to a percentage, find an equivalent fraction with 100 as the denominator: ${selected.n}/${selected.d} = ${selected.p}/100 = ${selected.p}%.`
    }
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const type = rules.type || randomChoice(['identify', 'calculate', 'convert']);

  switch (type) {
    case 'calculate':
      return generateCalculateProblem(rules);
    case 'convert':
      return generateConvertProblem(rules);
    case 'identify':
    default:
      return generateIdentifyProblem(rules);
  }
};

export default {
  generateProblem
};
