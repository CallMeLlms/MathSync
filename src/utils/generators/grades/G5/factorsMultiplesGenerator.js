import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * factorsMultiplesGenerator.js (Grade 5)
 * Generates problems for identifying factors, multiples, primes, and composite numbers.
 * Designed for grid-based selection gameplay.
 */

// ============================================================================
// HELPERS
// ============================================================================

const isPrime = (n) => {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
};

const getFactors = (n) => {
  const factors = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
};

const getMultiples = (n, count, start = 1) => {
  const multiples = [];
  for (let i = start; i < start + count; i++) {
    multiples.push(n * i);
  }
  return multiples;
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

const generateFactorsProblem = (rules) => {
  const gridSize = rules.gridSize || 8;
  const targetNumber = randomInt(12, rules.maxValue || 100);
  const allFactors = getFactors(targetNumber);
  
  // Decide how many factors to show (at least 2, at most grid-2)
  const numCorrect = randomInt(2, Math.min(allFactors.length, gridSize - 2));
  const correctFactors = shuffleArray(allFactors).slice(0, numCorrect);
  
  const choicesSet = new Set(correctFactors);
  while (choicesSet.size < gridSize) {
    const wrong = randomInt(2, targetNumber + 10);
    if (targetNumber % wrong !== 0) {
      choicesSet.add(wrong);
    }
  }
  
  const choices = shuffleArray(Array.from(choicesSet));
  const correctIndices = choices
    .map((num, i) => (targetNumber % num === 0 ? i : -1))
    .filter(i => i !== -1);

  return {
    answer: correctFactors.sort((a, b) => a - b).join(', '),
    choices,
    metadata: {
      displayQuestion: `Find all factors of ${targetNumber}.`,
      hint: `Factors are numbers that divide evenly into ${targetNumber}.`,
      targetNumber,
      correctIndices,
      type: 'factors',
      explanation: `To find the factors of ${targetNumber}, divide it by each number from 1 up to ${targetNumber}. If there is no remainder, it is a factor.`
    }
  };
};

const generateMultiplesProblem = (rules) => {
  const gridSize = rules.gridSize || 8;
  const targetNumber = randomInt(2, 12);
  
  // Generate some correct multiples
  const numCorrect = randomInt(2, Math.floor(gridSize / 2));
  const correctMultiples = getMultiples(targetNumber, numCorrect, randomInt(1, 5));
  
  const choicesSet = new Set(correctMultiples);
  while (choicesSet.size < gridSize) {
    const wrong = randomInt(targetNumber + 1, targetNumber * 10);
    if (wrong % targetNumber !== 0) {
      choicesSet.add(wrong);
    }
  }
  
  const choices = shuffleArray(Array.from(choicesSet));
  const correctIndices = choices
    .map((num, i) => (num % targetNumber === 0 ? i : -1))
    .filter(i => i !== -1);

  return {
    answer: correctMultiples.sort((a, b) => a - b).join(', '),
    choices,
    metadata: {
      displayQuestion: `Identify the multiples of ${targetNumber}.`,
      hint: `Multiples of ${targetNumber} are numbers you reach when skip-counting by ${targetNumber}.`,
      explanation: `To find the multiples of ${targetNumber}, multiply it by 1, 2, 3, and so on. Any number that ${targetNumber} divides into evenly is a multiple.`,
      targetNumber,
      correctIndices,
      type: 'multiples'
    }
  };
};

const generatePrimeCompositeProblem = (rules) => {
  const gridSize = rules.gridSize || 8;
  const mode = randomChoice(['prime', 'composite']);
  
  const choicesSet = new Set();
  const correctChoices = [];
  
  while (choicesSet.size < gridSize) {
    const num = randomInt(2, rules.maxValue || 50);
    const isNumPrime = isPrime(num);
    
    if (mode === 'prime' && isNumPrime && correctChoices.length < gridSize / 2) {
      correctChoices.push(num);
      choicesSet.add(num);
    } else if (mode === 'composite' && !isNumPrime && correctChoices.length < gridSize / 2) {
      correctChoices.push(num);
      choicesSet.add(num);
    } else {
      choicesSet.add(num);
    }
  }
  
  const choices = shuffleArray(Array.from(choicesSet));
  const correctIndices = choices
    .map((num, i) => (mode === 'prime' ? isPrime(num) : !isPrime(num)) ? i : -1)
    .filter(i => i !== -1);

  const displayQuestion = mode === 'prime' 
    ? 'Select all PRIME numbers.' 
    : 'Select all COMPOSITE numbers.';

  const hint = mode === 'prime'
    ? 'Prime numbers have exactly two factors: 1 and itself.'
    : 'Composite numbers have more than two factors.';

  return {
    answer: choices.filter((_, i) => correctIndices.includes(i)).sort((a, b) => a - b).join(', '),
    choices,
    metadata: {
      displayQuestion,
      hint,
      explanation: mode === 'prime' 
        ? 'A prime number has only two factors: 1 and itself (e.g., 2, 3, 5, 7, 11).'
        : 'A composite number has more than two factors (e.g., 4, 6, 8, 9, 10).',
      mode,
      correctIndices,
      type: 'primeComposite'
    }
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const type = rules.type || randomChoice(['factors', 'multiples', 'primeComposite']);

  switch (type) {
    case 'multiples':
      return generateMultiplesProblem(rules);
    case 'primeComposite':
      return generatePrimeCompositeProblem(rules);
    case 'factors':
    default:
      return generateFactorsProblem(rules);
  }
};

export default {
  generateProblem
};
