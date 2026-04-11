import { randomInt, randomChoice, shuffleArray } from '../../core/mathHelpers';

/**
 * placeValueGenerator.js (Grade 2)
 * Generates place value problems: identify, digitValue, expand, compose, and compare.
 */

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

const getDigitAtPlace = (num, place) => {
  switch (place) {
    case 'ones': return num % 10;
    case 'tens': return Math.floor(num / 10) % 10;
    case 'hundreds': return Math.floor(num / 100) % 10;
    case 'thousands': return Math.floor(num / 1000) % 10;
    default: return 0;
  }
};

const getValueAtPlace = (num, place) => {
  const digit = getDigitAtPlace(num, place);
  const multipliers = { ones: 1, tens: 10, hundreds: 100, thousands: 1000 };
  return digit * (multipliers[place] || 1);
};

const toExpandedForm = (num) => {
  const parts = [];
  const places = ['thousands', 'hundreds', 'tens', 'ones'];
  
  places.forEach(place => {
    const val = getValueAtPlace(num, place);
    if (val > 0) parts.push(val.toString());
  });
  
  return parts.length > 0 ? parts.join(' + ') : '0';
};

const getPlaceValues = (num) => {
  return {
    ones: getDigitAtPlace(num, 'ones'),
    tens: getDigitAtPlace(num, 'tens'),
    hundreds: getDigitAtPlace(num, 'hundreds'),
    thousands: num >= 1000 ? getDigitAtPlace(num, 'thousands') : undefined
  };
};

const PROMPTS = {
  identify: {
    question: (place) => `What digit is in the ${place} place?`,
    hint: (place) => `Remember: ones are on the far right, then tens, then hundreds. Look for the ${place} place!`
  },
  digitValue: {
    question: (digit, num) => `The ${digit} in ${num} represents...`,
    hint: () => `The value of a digit depends on its place. A digit in the tens place is worth 10 times more!`
  },
  expand: {
    question: () => `Write this number in expanded form:`,
    hint: () => `Break the number into hundreds + tens + ones. Each digit gets its value based on its position.`
  },
  compose: {
    question: () => `What number is this?`,
    hint: () => `Add up all the parts. Each value goes to its correct place in the number.`
  },
  compare: {
    question: (place) => `Which number has a larger digit in the ${place} place?`,
    hint: (place) => `Look at just the ${place} digit in each number. Which one is bigger?`
  }
};

/**
 * Ensures a unique set of choices
 */
const finalizeChoices = (answer, distractors, count = 4) => {
  const choices = new Set();
  choices.add(answer);
  
  // Add unique distractors
  distractors.forEach(d => {
    if (choices.size < count) choices.add(d);
  });
  
  // Fill remaining if needed
  while (choices.size < count) {
    const fallback = randomInt(0, 1000).toString();
    choices.add(fallback);
  }
  
  return shuffleArray(Array.from(choices));
};

// ============================================================================
// PROBLEM SUB-GENERATORS
// ============================================================================

const generateIdentify = (number, targetPlace) => {
  const answer = getDigitAtPlace(number, targetPlace).toString();
  const digit = getDigitAtPlace(number, targetPlace);
  
  const distractors = [
    ((digit + 1) % 10).toString(),
    ((digit + 2) % 10).toString(),
    ((digit + 9) % 10).toString(),
    randomInt(0, 9).toString()
  ];

  return {
    answer,
    choices: finalizeChoices(answer, distractors),
    metadata: {
      displayQuestion: PROMPTS.identify.question(targetPlace),
      hint: PROMPTS.identify.hint(targetPlace),
      number
    }
  };
};

const generateDigitValue = (number, targetPlace) => {
  const digit = getDigitAtPlace(number, targetPlace);
  const answer = getValueAtPlace(number, targetPlace).toString();
  
  const distractors = [
    digit.toString(),
    (digit * (targetPlace === 'tens' ? 100 : targetPlace === 'hundreds' ? 10 : 1000)).toString(),
    (digit * (targetPlace === 'ones' ? 10 : 1)).toString(),
    randomChoice([1, 10, 100, 1000]).toString()
  ];

  return {
    answer,
    choices: finalizeChoices(answer, distractors),
    metadata: {
      displayQuestion: PROMPTS.digitValue.question(digit, number),
      hint: PROMPTS.digitValue.hint(),
      number
    }
  };
};

const generateExpand = (number) => {
  const answer = toExpandedForm(number);
  const distractors = [
    toExpandedForm(number + 10),
    toExpandedForm(Math.abs(number - 1)),
    number.toString(),
    toExpandedForm(randomInt(10, 1000))
  ];

  return {
    answer,
    choices: finalizeChoices(answer, distractors),
    metadata: {
      displayQuestion: PROMPTS.expand.question(),
      displayText: number.toString(),
      hint: PROMPTS.expand.hint(),
      number
    }
  };
};

const generateCompose = (number) => {
  const expanded = toExpandedForm(number);
  const answer = number.toString();
  const distractors = [
    (number + 10).toString(),
    (number - 1).toString(),
    (getDigitAtPlace(number, 'ones') + getDigitAtPlace(number, 'tens') + getDigitAtPlace(number, 'hundreds')).toString(),
    randomInt(10, 1000).toString()
  ];

  return {
    answer,
    choices: finalizeChoices(answer, distractors),
    metadata: {
      displayQuestion: PROMPTS.compose.question(),
      displayText: expanded,
      hint: PROMPTS.compose.hint(),
      number
    }
  };
};

const generateCompare = (num1, num2, targetPlace) => {
  const digit1 = getDigitAtPlace(num1, targetPlace);
  const digit2 = getDigitAtPlace(num2, targetPlace);
  
  const answer = digit1 > digit2 ? num1.toString() : num2.toString();

  return {
    answer,
    choices: shuffleArray([num1.toString(), num2.toString()]),
    metadata: {
      displayQuestion: PROMPTS.compare.question(targetPlace),
      displayText: `${num1} or ${num2}`,
      hint: PROMPTS.compare.hint(targetPlace),
      num1,
      num2
    }
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export const generateProblem = (rules = {}) => {
  const {
    types = ['identify', 'digitValue', 'expand', 'compose', 'compare'],
    max = 1000,
    min = 10,
    includeThousands = false
  } = rules;

  const selectedType = randomChoice(types);
  const number = randomInt(min, max);
  
  const availablePlaces = ['ones', 'tens'];
  if (number >= 100) availablePlaces.push('hundreds');
  if (includeThousands || number >= 1000) availablePlaces.push('thousands');
  
  const targetPlace = randomChoice(availablePlaces);

  let problem;
  switch (selectedType) {
    case 'identify':
      problem = generateIdentify(number, targetPlace);
      break;
    case 'digitValue':
      problem = generateDigitValue(number, targetPlace);
      break;
    case 'expand':
      problem = generateExpand(number);
      break;
    case 'compose':
      problem = generateCompose(number);
      break;
    case 'compare': {
      let num2 = randomInt(min, max);
      while (getDigitAtPlace(num2, targetPlace) === getDigitAtPlace(number, targetPlace)) {
        num2 = randomInt(min, max);
      }
      problem = generateCompare(number, num2, targetPlace);
      break;
    }
    default:
      problem = generateIdentify(number, targetPlace);
  }

  return {
    ...problem,
    metadata: {
      ...problem.metadata,
      type: selectedType,
      targetPlace,
      placeValues: getPlaceValues(number),
      rules
    }
  };
};

export default {
  generateProblem
};
