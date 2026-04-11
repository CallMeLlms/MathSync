/**
 * registry.js
 * Central topic management for generative games.
 */
import * as algebraG6 from './grades/G6/algebraGenerator';

export const GeneratorRegistry = {
  // Topic ID mapping
  'algebra-basics': algebraG6.generateProblem,
  
  // Placeholders for future ports
  // 'counting': countingG1.generateProblem,
  // 'fractions': fractionsG3.generateProblem,
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
