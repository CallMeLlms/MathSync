import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers.js';

/**
 * measurementGenerator.js (Grade 4)
 * Generates measurement problems (Length, Weight, Capacity) with various types.
 */

// ============================================================================
// CONFIGURATION & DATA
// ============================================================================

const CONVERSIONS = {
  length: [
    { from: 'cm', to: 'm', factor: 100, label: 'Centimeters to Meters' },
    { from: 'm', to: 'cm', factor: 0.01, label: 'Meters to Centimeters' },
    { from: 'm', to: 'km', factor: 1000, label: 'Meters to Kilometers' },
    { from: 'km', to: 'm', factor: 0.001, label: 'Kilometers to Meters' },
    { from: 'in', to: 'ft', factor: 12, label: 'Inches to Feet' },
    { from: 'ft', to: 'in', factor: 1 / 12, label: 'Feet to Inches' },
  ],
  weight: [
    { from: 'g', to: 'kg', factor: 1000, label: 'Grams to Kilograms' },
    { from: 'kg', to: 'g', factor: 0.001, label: 'Kilograms to Grams' },
    { from: 'oz', to: 'lb', factor: 16, label: 'Ounces to Pounds' },
    { from: 'lb', to: 'oz', factor: 1 / 16, label: 'Pounds to Ounces' },
  ],
  capacity: [
    { from: 'mL', to: 'L', factor: 1000, label: 'Milliliters to Liters' },
    { from: 'L', to: 'mL', factor: 0.001, label: 'Liters to Milliliters' },
    { from: 'cups', to: 'pints', factor: 2, label: 'Cups to Pints' },
    { from: 'pints', to: 'quarts', factor: 2, label: 'Pints to Quarts' },
    { from: 'quarts', to: 'gallons', factor: 4, label: 'Quarts to Gallons' },
  ],
};

const CATEGORY_ICONS = {
  length: '📏',
  weight: '⚖️',
  capacity: '🥤',
};

// ============================================================================
// HELPERS
// ============================================================================

const formatValue = (val) => {
  if (Number.isInteger(val)) return val.toString();
  return parseFloat(val.toFixed(2)).toString();
};

const generateChoices = (correctValue, unit, count = 4) => {
  const correctStr = `${formatValue(correctValue)} ${unit}`;
  const wrongChoices = new Set();
  
  const multipliers = [0.1, 0.5, 2, 10, 0.2, 5];
  const shifts = [1, 2, 5, 10, 100];

  while (wrongChoices.size < count - 1) {
    let wrongValue;
    if (Math.random() > 0.5) {
      wrongValue = correctValue * randomChoice(multipliers);
    } else {
      wrongValue = correctValue + randomChoice(shifts);
    }
    
    wrongValue = parseFloat(wrongValue.toFixed(2));
    const choice = `${formatValue(wrongValue)} ${unit}`;
    
    if (choice !== correctStr && wrongValue > 0) {
      wrongChoices.add(choice);
    }
  }

  return shuffleArray([correctStr, ...Array.from(wrongChoices)]);
};

const getHint = (conv) => {
  const isMultiplication = conv.factor < 1;
  const multiplier = Math.round(1 / conv.factor);
  const factorLabel = isMultiplication ? multiplier : conv.factor;
  
  return isMultiplication 
    ? `Remember: 1 ${conv.from} equals ${factorLabel} ${conv.to}. Multiply by ${factorLabel}!`
    : `Remember: There are ${factorLabel} ${conv.from} in 1 ${conv.to}. Divide by ${factorLabel}!`;
};

// ============================================================================
// SUB-GENERATORS
// ============================================================================

const generateConvertProblem = (rules, category) => {
  const conv = randomChoice(CONVERSIONS[category]);
  const isToSmaller = conv.factor < 1; // e.g., m to cm (0.01) -> multiply by 100
  const factor = isToSmaller ? Math.round(1 / conv.factor) : conv.factor;
  
  let fromValue;
  if (isToSmaller) {
    fromValue = randomInt(1, Math.min(20, rules.maxValue || 100));
  } else {
    // To bigger unit: use multiples of factor for clean whole numbers
    fromValue = randomInt(1, 10) * factor;
  }

  const answerValue = isToSmaller ? fromValue * factor : fromValue / factor;
  const answer = `${formatValue(answerValue)} ${conv.to}`;
  
  const prompts = [
    `Convert ${fromValue} ${conv.from} to ${conv.to}.`,
    `How many ${conv.to} are in ${fromValue} ${conv.from}?`,
    `${fromValue} ${conv.from} = ? ${conv.to}`
  ];

  return {
    answer,
    choices: generateChoices(answerValue, conv.to),
    metadata: {
      displayQuestion: randomChoice(prompts),
      hint: getHint(conv),
      category,
      categoryIcon: CATEGORY_ICONS[category],
      conversion: conv,
      explanation: `To solve measurement problems, focus on the unit of measure. When converting, remember the scale (e.g., 100cm = 1m). When comparing, convert everything to the same unit first.`
    }
  };
};

const generateCompareProblem = (rules, category) => {
  const conv = CONVERSIONS[category].find(c => c.factor < 1) || CONVERSIONS[category][0];
  const factor = Math.round(1 / conv.factor);
  
  const val1 = randomInt(1, 10);
  const val2 = randomInt(1, val1 * factor * 1.5);
  
  const val1InSmall = val1 * factor;
  let answer;
  let displayQuestion;

  if (val1InSmall > val2) {
    answer = `${val1} ${conv.from}`;
    displayQuestion = `Which is larger: ${val1} ${conv.from} or ${val2} ${conv.to}?`;
  } else if (val1InSmall < val2) {
    answer = `${val2} ${conv.to}`;
    displayQuestion = `Which is larger: ${val1} ${conv.from} or ${val2} ${conv.to}?`;
  } else {
    answer = 'They are equal';
    displayQuestion = `Compare: ${val1} ${conv.from} and ${val2} ${conv.to}.`;
  }

  const choices = shuffleArray([
    `${val1} ${conv.from}`,
    `${val2} ${conv.to}`,
    'They are equal',
    'Cannot determine'
  ]);

  return {
    answer,
    choices,
    metadata: {
      displayQuestion,
      hint: `Convert both to ${conv.to} first: ${val1} ${conv.from} is ${val1InSmall} ${conv.to}.`,
      explanation: `To solve measurement problems, focus on the unit of measure. When converting, remember the scale (e.g., 100cm = 1m). When comparing, convert everything to the same unit first.`,
      category,
      categoryIcon: CATEGORY_ICONS[category],
      comparison: { val1, unit1: conv.from, val2, unit2: conv.to }
    }
  };
};

const generateWordProblem = (rules, category) => {
  const templates = {
    length: [
      { q: 'A piece of rope is VALUE cm long. How many meters is that?', from: 'cm', to: 'm' },
      { q: 'Sarah ran VALUE m. How many kilometers did she run?', from: 'm', to: 'km' }
    ],
    weight: [
      { q: 'A heavy box weighs VALUE g. What is its weight in kilograms?', from: 'g', to: 'kg' },
      { q: 'A puppy weighs VALUE lb. How many ounces is that?', from: 'lb', to: 'oz' }
    ],
    capacity: [
      { q: 'A jug holds VALUE L of water. How many milliliters is that?', from: 'L', to: 'mL' },
      { q: 'Chef Mario has VALUE quarts of milk. How many gallons is that?', from: 'quarts', to: 'gallons' }
    ]
  };

  const template = randomChoice(templates[category]);
  const conv = CONVERSIONS[category].find(c => c.from === template.from && c.to === template.to);
  
  // Reuse convert logic for calculation
  const isToSmaller = conv.factor < 1;
  const factor = isToSmaller ? Math.round(1 / conv.factor) : conv.factor;
  
  let fromValue = isToSmaller ? randomInt(1, 10) : randomInt(1, 5) * factor;
  const answerValue = isToSmaller ? fromValue * factor : fromValue / factor;
  const answer = `${formatValue(answerValue)} ${conv.to}`;

  return {
    answer,
    choices: generateChoices(answerValue, conv.to),
    metadata: {
      displayQuestion: template.q.replace('VALUE', fromValue),
      hint: getHint(conv),
      category,
      categoryIcon: CATEGORY_ICONS[category],
      explanation: `To solve measurement problems, focus on the unit of measure. When converting, remember the scale (e.g., 100cm = 1m). When comparing, convert everything to the same unit first.`,
      isWordProblem: true
    }
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    category = randomChoice(['length', 'weight', 'capacity']),
    type = randomChoice(['convert', 'compare', 'wordProblem'])
  } = rules;

  switch (type) {
    case 'compare':
      return generateCompareProblem(rules, category);
    case 'wordProblem':
      return generateWordProblem(rules, category);
    case 'convert':
    default:
      return generateConvertProblem(rules, category);
  }
};

export default {
  generateProblem
};
