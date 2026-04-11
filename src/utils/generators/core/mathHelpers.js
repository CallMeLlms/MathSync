/**
 * mathHelpers.js
 * Core primitives for problem generation logic.
 */

/**
 * Generate a random integer between min and max (inclusive).
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 */
export function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Shuffle an array in-place.
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate smart distractors based on common errors.
 */
export function generateSmartChoices(correctAnswer, errorOffsets = [-1, 1, -2, 2], count = 4) {
  const choices = new Set();
  choices.add(correctAnswer);

  // Attempt to add strategic distractors
  const shuffledOffsets = shuffleArray(errorOffsets);
  for (const offset of shuffledOffsets) {
    if (choices.size >= count) break;
    const distractor = correctAnswer + offset;
    if (distractor !== correctAnswer) {
      choices.add(distractor);
    }
  }

  // Fill remaining slots with random nearby numbers if needed
  while (choices.size < count) {
    const random = correctAnswer + randomInt(-10, 10);
    if (random !== correctAnswer) {
      choices.add(random);
    }
  }

  return shuffleArray(Array.from(choices));
}
