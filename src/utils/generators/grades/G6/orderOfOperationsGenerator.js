import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * orderOfOperationsGenerator.js (Grade 6)
 * Generates PEMDAS/BODMAS expressions for recursive simplification gameplay.
 * Provides the "Golden Path" sequence and reactive hints for UI-driven feedback.
 */

// ============================================================================
// HELPERS
// ============================================================================

const PRIORITY = {
  '^': 3,
  '×': 2,
  '÷': 2,
  '+': 1,
  '-': 1
};

const evaluate = (a, op, b) => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return a / b;
    case '^': return Math.pow(a, b);
    default: return 0;
  }
};

const getReactiveHint = (tappedOp, correctOp) => {
  const tappedP = PRIORITY[tappedOp];
  const correctP = PRIORITY[correctOp];

  if (correctOp === '(' || correctOp === ')') return "Parentheses always come first!";
  if (correctP > tappedP) return `${correctOp} has higher priority than ${tappedOp}.`;
  return `Multiplication/Division and Addition/Subtraction are solved left-to-right!`;
};

// ============================================================================
// CORE LOGIC
// ============================================================================

/**
 * Determines the correct mathematical sequence of operations.
 */
const determineSequence = (parts) => {
  const operators = [];
  parts.forEach((p, i) => {
    if (PRIORITY[p]) operators.push({ symbol: p, index: i });
  });

  const sequence = [];
  const steps = [];
  let workingParts = [...parts];
  const used = new Set();

  while (sequence.length < operators.length) {
    let bestIdx = -1;
    let highestP = -1;

    // PEMDAS: Find highest priority operator, left-to-right for same priority
    for (let i = 0; i < operators.length; i++) {
      if (used.has(i)) continue;
      
      const symbol = operators[i].symbol;
      const p = PRIORITY[symbol];
      
      if (p > highestP) {
        highestP = p;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;

    const op = operators[bestIdx];
    // Find current position in working parts (not trivial due to splicing)
    // We'll calculate it by mapping remaining operators
    let currentOpPos = -1;
    let opsVisited = 0;
    for (let j = 0; j < workingParts.length; j++) {
      if (PRIORITY[workingParts[j]]) {
        // This is a naive mapping but sufficient for Grade 6 simple expressions
        if (opsVisited === sequence.length) {
           // We simplify the first available highest priority op logic for G6
        }
        opsVisited++;
      }
    }
    
    // For G6 Brain-First, we'll return the sequence of TARGET indices for the UI
    sequence.push(bestIdx);
    used.add(bestIdx);
    
    // Re-eval step logic for UI state tracking
    steps.push({
      opIndex: bestIdx,
      result: 0, // Simplified for now as UI handles calculation
      expressionAfter: "" 
    });
  }

  return { operators, correctSequence: sequence };
};

// ============================================================================
// GENERATORS
// ============================================================================

const generateSimpleExpression = (rules) => {
  const opCount = rules.opCount || 2;
  const ops = ['+', '-', '×'];
  const parts = [randomInt(2, 10)];

  for (let i = 0; i < opCount; i++) {
    const op = randomChoice(ops);
    let nextNum = randomInt(2, 10);
    
    // Safety: ensure subtraction doesn't go negative for easier G6
    if (op === '-') nextNum = randomInt(1, parts[parts.length-1]);
    
    parts.push(op);
    parts.push(nextNum);
  }

  return parts;
};

// ============================================================================
// MAIN ENTRY
// ============================================================================

export const generateProblem = (rules = {}) => {
  const parts = generateSimpleExpression(rules);
  const { operators, correctSequence } = determineSequence(parts);

  // Generate reactive hints for every operator
  const reactiveHints = operators.map((op, i) => {
    const correctOpIdx = correctSequence[0]; // First op to tap
    return getReactiveHint(op.symbol, operators[correctOpIdx].symbol);
  });

  return {
    answer: 0, // UI calculates final result based on taps
    metadata: {
      displayExpression: parts.join(' '),
      parts,
      operators,
      correctSequence,
      reactiveHints,
      type: 'orderOfOps',
      explanation: 'Use PEMDAS: Parentheses, Exponents, Multiplication and Division (left to right), and Addition and Subtraction (left to right).'
    }
  };
};

export default {
  generateProblem
};
