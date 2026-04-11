import { GeneratorRegistry } from '../src/utils/generators/registry.js';

/**
 * verify_all_generators.mjs
 * Batch validation for all registered math brains.
 */

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
};

async function verifyGenerator(id, generator) {
  console.log(`\n--- Testing [${id}] ---`);
  stats.total++;
  
  try {
    // Run 10 iterations to catch variety
    for (let i = 0; i < 10; i++) {
      const problem = generator();
      
      // 1. Structure Check
      if (!problem.answer || !problem.choices || !problem.metadata) {
        throw new Error('Missing core fields (answer, choices, or metadata)');
      }

      // 2. Choice Uniqueness Check
      const uniqueChoices = new Set(problem.choices);
      if (uniqueChoices.size < problem.choices.length) {
        throw new Error(`Duplicate choices found: [${problem.choices.join(', ')}]`);
      }

      // 3. Answer Consistency Check
      const answerStr = problem.answer.toString();
      const choiceStrings = problem.choices.map(c => c.toString());
      
      const answerParts = answerStr.split(', ');
      const isSimpleMatch = choiceStrings.includes(answerStr);
      const areAllPartsInChoices = answerParts.every(p => choiceStrings.includes(p));
      
      if (!isSimpleMatch && !areAllPartsInChoices && id !== 'multiplication-matching') {
        throw new Error(`Correct answer "${answerStr}" not found or partial mismatch with choices [${choiceStrings.join(', ')}]`);
      }

      // 4. Metadata Guidelines Check
      const meta = problem.metadata;
      if (!meta.displayQuestion) throw new Error('Missing displayQuestion in metadata');
      if (!meta.hint) console.warn(`${YELLOW}[WARNING]${RESET} Missing hint in metadata for ${id}`);
      if (!meta.explanation) {
        stats.warnings++;
        console.warn(`${YELLOW}[WARNING]${RESET} Missing explanation in metadata for ${id}`);
      }
    }
    
    console.log(`${GREEN}[PASS]${RESET} Generator is healthy.`);
    stats.passed++;
  } catch (err) {
    console.error(`${RED}[FAIL]${RESET} ${err.message}`);
    stats.failed++;
  }
}

async function run() {
  const topics = Object.keys(GeneratorRegistry);
  
  for (const id of topics) {
    await verifyGenerator(id, GeneratorRegistry[id]);
  }
  
  console.log('\n======================================');
  console.log(`RESULTS: ${stats.passed}/${stats.total} Passed`);
  if (stats.failed > 0) console.log(`${RED}${stats.failed} Failed${RESET}`);
  if (stats.warnings > 0) console.log(`${YELLOW}${stats.warnings} Warnings (Missing Metadata)${RESET}`);
  console.log('======================================\n');
}

run();
