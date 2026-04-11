/**
 * registry.js
 * Central topic management for generative games.
 */
import * as algebraG6 from './grades/G6/algebraGenerator.js';
import * as fractionsG4 from './grades/G4/advancedFractionsGenerator.js';
import * as placeValueG2 from './grades/G2/placeValueGenerator.js';
import * as roundingG2 from './grades/G2/roundingGenerator.js';
import * as orderingG2 from './grades/G2/orderingNumberGenerator.js';
import * as multiplicationG3 from './grades/G3/multiplicationGenerator.js';
import * as multiplicationMatchingG3 from './grades/G3/multiplicationMatchingGenerator.js';
import * as timeAndMoneyG3 from './grades/G3/timeAndMoneyGenerator.js';
import * as decimalsG4 from './grades/G4/orderingDecimalsGenerator.js';
import * as measurementG4 from './grades/G4/measurementGenerator.js';
import * as factorsG5 from './grades/G5/factorsMultiplesGenerator.js';
import * as meanMedianG5 from './grades/G5/meanMedianGenerator.js';
import * as percentagesG5 from './grades/G5/percentagesGenerator.js';

export const GeneratorRegistry = {
  // Grade 2
  'place-value': placeValueG2.generateProblem,
  'rounding': roundingG2.generateProblem,
  'ordering-numbers': orderingG2.generateProblem,

  // Grade 3
  'multiplication': multiplicationG3.generateProblem,
  'multiplication-matching': multiplicationMatchingG3.generateProblem,
  'time-money': timeAndMoneyG3.generateProblem,

  // Grade 4
  'advanced-fractions': fractionsG4.generateProblem,
  'ordering-decimals': decimalsG4.generateProblem,
  'measurement': measurementG4.generateProblem,

  // Grade 5
  'factors-multiples': factorsG5.generateProblem,
  'mean-median': meanMedianG5.generateProblem,
  'percentages': percentagesG5.generateProblem,

  // Grade 6
  'algebra-basics': algebraG6.generateProblem,
};

/**
 * Helper to resolve a generator by ID
 */
export const getGeneratorById = (id) => {
  const generator = GeneratorRegistry[id];
  if (!generator) {
    console.warn(`Generator for topic "${id}" not found in registry.`);
    return null;
  }
  return generator;
};
