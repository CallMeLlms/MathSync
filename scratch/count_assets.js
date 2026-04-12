const fs = require('fs');
const path = require('path');

const gameDataDir = 'd:/LAWLL/VISUALSHIT/GITREPO/Projects/MathSync/content/game-data';
const assetIds = new Set();
const potentialAssets = new Set();
const typeCounts = { concrete: 0, pictorial: 0, abstract: 0, other: 0 };

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.json')) {
            analyzeFile(fullPath);
        }
    }
}

function analyzeFile(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!content.questions) return;

        content.questions.forEach(q => {
            const level = q.level || 'other';
            typeCounts[level] = (typeCounts[level] || 0) + 1;

            if (q.assetId) assetIds.add(q.assetId);

            // Check metadata for common asset fields
            if (q.metadata) {
                if (q.metadata.scenario) potentialAssets.add(`scenario_${q.metadata.scenario}`);
                if (q.metadata.pieces) q.metadata.pieces.forEach(p => potentialAssets.add(`piece_${p}`));
                if (q.metadata.target) potentialAssets.add(`target_${q.metadata.target}`);
            }

            // Check pairs for Matcher engines
            if (q.pairs) {
                q.pairs.forEach(p => {
                    if (typeof p.left === 'string' && (p.left.includes('_') || p.left.length > 5)) potentialAssets.add(p.left);
                    if (typeof p.right === 'string' && (p.right.includes('_') || p.right.length > 5)) potentialAssets.add(p.right);
                });
            }
        });
    } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
    }
}

walkDir(gameDataDir);

console.log('--- ANALYSIS RESULTS ---');
console.log('Total Questions by Level:', typeCounts);
console.log('Defined assetId Count:', assetIds.size);
console.log('Potential Implicit Assets:', potentialAssets.size);
console.log('\nList of defined assetId values:');
console.log(Array.from(assetIds).sort());
console.log('\nSpecific Implicit Assets Found:');
console.log(Array.from(potentialAssets).sort());
