import { randomInt, randomChoice, shuffleArray } from '../core/mathHelpers';

/**
 * arithmeticGenerator.js (Common)
 * A centralized generator for basic arithmetic operations.
 * Serves as a shared core for addition, subtraction, multiplication, and division problems.
 */

// ============================================================================
// CONFIG & CONSTANTS
// ============================================================================

const SYMBOLS = {
  addition: '+',
  subtraction: '-',
  multiplication: '×',
  division: '÷'
};

const PROMPTS = {
  question: (a, symbol, b) => `${a} ${symbol} ${b} = ?`,
  hints: {
    addition: () => 'Count up from the first number, or combine the groups.',
    subtraction: () => 'Taking away from the first number. Think: what plus the second number equals the first?',
    multiplication: () => 'Multiplication is repeated addition.',
    division: () => 'Division is splitting into equal groups. Think: what times the divisor equals the dividend?'
  }
};

// ============================================================================
// HELPERS
// ============================================================================

const finalizeChoices = (answer, distractors, range, count = 4) => {
  const choices = new Set();
  choices.add(answer.toString());
  
  distractors.forEach(d => {
    if (choices.size < count) choices.add(d.toString());
  });
  
  while (choices.size < count) {
    const fallback = randomInt(0, range * 2).toString();
    choices.add(fallback);
  }
  
  return shuffleArray(Array.from(choices));
};

// ============================================================================
// OPERATION LOGIC
// ============================================================================

const generateAddition = (min, max) => {
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  return { a, b, answer: a + b };
};

const generateSubtraction = (min, max) => {
  const ans = randomInt(min, max);
  const b = randomInt(min, max);
  const a = ans + b;
  return { a, b, answer: ans };
};

const generateMultiplication = (min, maxFactor) => {
  const a = randomInt(min, maxFactor);
  const b = randomInt(min, maxFactor);
  return { a, b, answer: a * b };
};

const generateDivision = (min, maxFactor) => {
  const ans = randomInt(min, maxFactor);
  const b = randomInt(Math.max(1, min), maxFactor);
  const a = ans * b;
  return { a, b, answer: ans };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    operations = ['addition', 'subtraction', 'multiplication', 'division'],
    min = 1,
    max = 100,
    maxFactor = 12,
    avoidZero = true
  } = rules;

  const operation = randomChoice(operations);
  const startMin = avoidZero ? Math.max(1, min) : min;

  let result;
  switch (operation) {
    case 'addition':
      result = generateAddition(startMin, max);
      break;
    case 'subtraction':
      result = generateSubtraction(startMin, max);
      break;
    case 'multiplication':
      result = generateMultiplication(startMin, maxFactor);
      break;
    case 'division':
      result = generateDivision(startMin, maxFactor);
      break;
    default:
      result = generateAddition(startMin, max);
  }

  const { a, b, answer } = result;
  
  // Distractors
  const distractors = [
    answer + 1,
    answer - 1,
    answer + 10,
    Math.abs(answer - 10),
    a + b, // relevant for sub/mult
    Math.abs(a - b), // relevant for add
    randomInt(startMin, max * 2)
  ].filter(d => d >= 0 && d !== answer);

  return {
    answer: answer.toString(),
    choices: finalizeChoices(answer, distractors, max),
    metadata: {
      displayQuestion: PROMPTS.question(a, SYMBOLS[operation], b),
      hint: PROMPTS.hints[operation](),
      operand1: a,
      operand2: b,
      operation,
      rules
    }
  };
};

export default {
  generateProblem
};
