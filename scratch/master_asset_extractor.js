const fs = require('fs');
const path = require('path');

const gameDataDir = 'd:/LAWLL/VISUALSHIT/GITREPO/Projects/MathSync/content/game-data';
const assetList = {
    questionAssets: new Set(),
    choiceAssets: new Set(),
    scenarios: new Set()
};

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

        const quarter = filePath.split(path.sep).find(p => p.startsWith('quarter-'));

        content.questions.forEach(q => {
            // 1. Question Assets (assetId in root)
            if (q.assetId) {
                assetList.questionAssets.add(`${quarter}: ${q.assetId} (${q.question})`);
            }

            // 2. Choice Assets (options in metadata)
            if (q.metadata && q.metadata.options) {
                q.metadata.options.forEach(opt => {
                    if (typeof opt === 'string' && !Number.isInteger(parseInt(opt))) {
                        assetList.choiceAssets.add(`${quarter}: ${opt} (Option for: ${q.id})`);
                    }
                });
            }

            // 3. Scenarios
            if (q.metadata && q.metadata.scenario) {
                assetList.scenarios.add(`${quarter}: ${q.metadata.scenario} (Background for: ${q.id})`);
            }

            // 4. Matcher Pairs
            if (q.pairs) {
                q.pairs.forEach(p => {
                    if (typeof p.left === 'string' && (p.left.includes('_') || p.left.length > 3)) {
                         assetList.choiceAssets.add(`${quarter}: ${p.left} (Match Left)`);
                    }
                    if (typeof p.right === 'string' && (p.right.includes('_') || p.right.length > 3)) {
                         assetList.choiceAssets.add(`${quarter}: ${p.right} (Match Right)`);
                    }
                });
            }
            
            // 5. Special Engine Fields
            if (q.metadata && q.metadata.pieces) {
                q.metadata.pieces.forEach(p => assetList.choiceAssets.add(`${quarter}: ${p} (Composer Piece)`));
            }
            if (q.metadata && q.metadata.target && typeof q.metadata.target === 'string') {
                assetList.questionAssets.add(`${quarter}: ${q.metadata.target} (Composer Target)`);
            }
        });
    } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
    }
}

walkDir(gameDataDir);

console.log('--- MASTER ASSET LIST ---');
console.log('QUESTION ASSETS:');
Array.from(assetList.questionAssets).sort().forEach(a => console.log(`- [ ] ${a}`));
console.log('\nSCENARIOS (Backgrounds):');
Array.from(assetList.scenarios).sort().forEach(a => console.log(`- [ ] ${a}`));
console.log('\nCHOICE ASSETS (Icons/Options):');
Array.from(assetList.choiceAssets).sort().forEach(a => console.log(`- [ ] ${a}`));
