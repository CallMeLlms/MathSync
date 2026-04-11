import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * algebraGenerator.js (Grade 6)
 * Generates one-step and two-step algebraic equations.
 * Focuses on isolating variables through inverse operations with clean whole-number solutions.
 */

// ============================================================================
// DATA & HELPERS
// ============================================================================

const CURATED_VARIABLES = ['x', 'y', 'n', 'a', 'b', 'k'];

const generateWrongChoices = (correctAnswer, range) => {
  const distractors = new Set();
  
  const strategies = [
    () => correctAnswer + 1,
    () => correctAnswer - 1,
    () => correctAnswer + randomInt(2, 5),
    () => correctAnswer - randomInt(2, 5),
    () => Math.round(correctAnswer * 2),
    () => Math.round(correctAnswer / 2),
    () => randomInt(range.min, range.max)
  ];

  while (distractors.size < 3) {
    const val = strategies[randomInt(0, strategies.length - 1)]();
    if (val !== correctAnswer && Number.isInteger(val)) {
      distractors.add(val);
    }
  }

  return shuffleArray([correctAnswer, ...Array.from(distractors)]);
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

const generateOneStepProblem = (rules, v) => {
  const operation = rules.operation || randomChoice(['addition', 'subtraction', 'multiplication']);
  const range = { min: 1, max: rules.maxValue || 20 };
  
  const a = randomInt(range.min, Math.round(range.max / 2));
  const answer = randomInt(range.min, Math.round(range.max / 2));
  let equation = '';
  let hint = '';
  let explanation = '';

  switch (operation) {
    case 'subtraction': {
      const b = answer - a; // x - a = b
      if (b < 1) { // Fallback if result is negative
        const sum = answer + a;
        equation = `${v} - ${a} = ${answer}`;
        hint = `Try adding ${a} to both sides to find ${v}.`;
        explanation = `${v} - ${a} = ${answer}\n${v} = ${answer} + ${a}\n${v} = ${answer + a}`;
        return { answer: answer + a, equation, hint, explanation };
      }
      equation = `${v} - ${a} = ${b}`;
      hint = `Try adding ${a} to both sides to find ${v}.`;
      explanation = `${v} - ${a} = ${b}\n${v} = ${b} + ${a}\n${v} = ${answer}`;
      break;
    }
    case 'multiplication': {
      const b = a * answer;
      equation = `${a}${v} = ${b}`;
      hint = `Try dividing both sides by ${a} to find ${v}.`;
      explanation = `${a}${v} = ${b}\n${v} = ${b} ÷ ${a}\n${v} = ${answer}`;
      break;
    }
    case 'addition':
    default: {
      const b = answer + a;
      equation = `${v} + ${a} = ${b}`;
      hint = `Try subtracting ${a} from both sides to find ${v}.`;
      explanation = `${v} + ${a} = ${b}\n${v} = ${b} - ${a}\n${v} = ${answer}`;
      break;
    }
  }

  return { answer, equation, hint, explanation };
};

const generateTwoStepProblem = (rules, v) => {
  const range = { min: 1, max: rules.maxValue || 30 };
  const a = randomInt(2, 5); // coefficient
  const answer = randomInt(1, 10);
  const b = randomInt(1, 15); // constant
  const isAddition = randomChoice([true, false]);

  let equation = '';
  let hint = 'Isolate the variable term first, then divide by the coefficient.';
  let explanation = '';
  let c;

  if (isAddition) {
    c = a * answer + b;
    equation = `${a}${v} + ${b} = ${c}`;
    explanation = `${equation}\nStep 1: Subtract ${b} from both sides\n${a}${v} = ${c - b}\nStep 2: Divide both sides by ${a}\n${v} = ${answer}`;
  } else {
    c = a * answer - b;
    if (c < 1) { // Fallback to avoid confusing negatives in G6 start
      c = a * answer + b;
      equation = `${a}${v} + ${b} = ${c}`;
      explanation = `${equation}\nStep 1: Subtract ${b} from both sides\n${a}${v} = ${c - b}\nStep 2: Divide both sides by ${a}\n${v} = ${answer}`;
    } else {
      equation = `${a}${v} - ${b} = ${c}`;
      explanation = `${equation}\nStep 1: Add ${b} to both sides\n${a}${v} = ${c + b}\nStep 2: Divide both sides by ${a}\n${v} = ${answer}`;
    }
  }

  return { answer, equation, hint, explanation };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const v = rules.variable || randomChoice(CURATED_VARIABLES);
  const type = rules.type || randomChoice(['oneStep', 'twoStep']);
  const maxVal = rules.maxValue || 20;

  let result;
  if (type === 'twoStep') {
    result = generateTwoStepProblem(rules, v);
  } else {
    result = generateOneStepProblem(rules, v);
  }

  return {
    answer: result.answer,
    choices: generateWrongChoices(result.answer, { min: 1, max: maxVal * 2 }),
    metadata: {
      displayQuestion: `Solve for ${v}: ${result.equation}`,
      hint: result.hint,
      explanation: result.explanation,
      variable: v,
      equation: result.equation,
      type
    }
  };
};

export default {
  generateProblem
};
