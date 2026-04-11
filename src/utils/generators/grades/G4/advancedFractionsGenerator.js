import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * advancedFractionsGenerator.js (Grade 4)
 * Modernized "Brain" for fraction logic.
 * Ported from legacy fractionProblemGenerator.ts.
 */

// ============================================================================
// HELPERS
// ============================================================================

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
};

const simplifyFraction = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
};

const fractionToString = (numerator, denominator) => `${numerator}/${denominator}`;

const areEquivalent = (f1, f2) => f1.numerator * f2.denominator === f2.numerator * f1.denominator;

const getCommonDenominators = (maxDenom) => {
  const common = [2, 3, 4, 5, 6, 8, 10, 12, 16, 20];
  return common.filter(d => d <= maxDenom);
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

/**
 * Identify: "3 out of 4 parts" -> 3/4
 */
const generateIdentify = (maxDenom) => {
  const denominator = randomInt(2, Math.min(8, maxDenom));
  const numerator = randomInt(1, denominator - 1);
  const answer = fractionToString(numerator, denominator);

  return {
    answer,
    choices: shuffleArray([
      answer,
      fractionToString(denominator, numerator), // Swapped
      fractionToString(numerator + 1, denominator),
      fractionToString(numerator, denominator + 1)
    ]),
    metadata: {
      displayQuestion: `${numerator} out of ${denominator} parts`,
      displayText: `${numerator} out of ${denominator} parts`,
      hint: "The numerator is the count, and the denominator is the total parts.",
      explanation: `In a fraction, the bottom number (denominator) is the total parts, and the top number (numerator) is the number of parts we have. So, ${numerator} out of ${denominator} is ${numerator}/${denominator}.`,
      type: "identify"
    }
  };
};

/**
 * Simplify: 4/8 -> 1/2
 */
const generateSimplify = (maxDenom) => {
  const simplest = { numerator: randomInt(1, 3), denominator: randomInt(2, 6) };
  const simplestRes = simplifyFraction(simplest.numerator, simplest.denominator);
  
  const multiplier = randomInt(2, 4);
  const numerator = simplestRes.numerator * multiplier;
  const denominator = simplestRes.denominator * multiplier;
  
  const answer = fractionToString(simplestRes.numerator, simplestRes.denominator);

  return {
    answer,
    choices: shuffleArray([
      answer,
      fractionToString(simplestRes.numerator + 1, simplestRes.denominator),
      fractionToString(numerator, denominator), // Unsimplified (trap)
      fractionToString(1, denominator)
    ]),
    metadata: {
      displayQuestion: `Simplify the fraction: ${numerator}/${denominator}`,
      displayText: fractionToString(numerator, denominator),
      hint: "Find a number that divides evenly into both the top and bottom.",
      explanation: `To simplify ${numerator}/${denominator}, we find the Greatest Common Divisor (${gcd(numerator, denominator)}). Dividing both by this gives ${answer}.`,
      type: "simplify"
    }
  };
};

/**
 * Add: 1/4 + 2/4 = 3/4
 */
const generateAdd = (maxDenom) => {
  const denominators = getCommonDenominators(maxDenom);
  const denominator = randomChoice(denominators);
  
  const n1 = randomInt(1, Math.floor(denominator / 2));
  const n2 = randomInt(1, denominator - n1 - 1);
  
  const fraction1 = { numerator: n1, denominator };
  const fraction2 = { numerator: n2, denominator };
  
  const res = simplifyFraction(n1 + n2, denominator);
  const answer = fractionToString(res.numerator, res.denominator);

  return {
    answer,
    choices: shuffleArray([
      answer,
      fractionToString(n1 + n2, denominator + denominator), // Common mistake
      fractionToString(n1 + n2 + 1, denominator),
      fractionToString(n1, n2)
    ]),
    metadata: {
      displayQuestion: `What is ${n1}/${denominator} + ${n2}/${denominator}?`,
      displayText: `${n1}/${denominator} + ${n2}/${denominator}`,
      fraction1,
      fraction2,
      hint: "When denominators are the same, just add the numerators!",
      explanation: `To add fractions with the same denominator, keep the denominator (${denominator}) and add the numerators: ${n1} + ${n2} = ${n1 + n2}. Then simplify if possible.`,
      type: "add"
    }
  };
};

/**
 * Equivalent: 1/2 = ?/4
 */
const generateEquivalent = (maxDenom) => {
  const base = simplifyFraction(randomInt(1, 3), randomInt(2, 5));
  const multiplier = randomInt(2, Math.floor(maxDenom / base.denominator) || 2);
  
  const target = {
    numerator: base.numerator * multiplier,
    denominator: base.denominator * multiplier
  };
  
  const answer = fractionToString(target.numerator, target.denominator);

  return {
    answer,
    choices: shuffleArray([
      answer,
      fractionToString(target.numerator + 1, target.denominator),
      fractionToString(target.numerator, target.denominator + 1),
      fractionToString(base.numerator, target.denominator)
    ]),
    metadata: {
      displayQuestion: `Find an equivalent fraction for ${base.numerator}/${base.denominator}`,
      displayText: fractionToString(base.numerator, base.denominator),
      hint: "Multiply both the top and bottom by the same number.",
      explanation: `Equivalent fractions represent the same value. By multiplying both the numerator and denominator of ${base.numerator}/${base.denominator} by ${multiplier}, we get ${answer}.`,
      type: "equivalent"
    }
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const type = rules.type || randomChoice(["identify", "simplify", "add", "equivalent"]);
  const maxDenom = rules.maxDenominator || 12;

  switch (type) {
    case "simplify": return generateSimplify(maxDenom);
    case "add": return generateAdd(maxDenom);
    case "equivalent": return generateEquivalent(maxDenom);
    case "identify":
    default:
      return generateIdentify(maxDenom);
  }
};

export default {
  generateProblem
};
