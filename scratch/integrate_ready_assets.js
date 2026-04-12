const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, 'question_bank_audit.md');
const CONTENT_DIR = path.join(__dirname, '../content/game-data');

const ASSET_MAP = {
  'TriangleShape.webp': 'shape_triangle',
  'RectangleShpae.webp': 'shape_rectangle',
  'SquareShape.webp': 'shape_square',
  'CircleShape.webp': 'shape_circle',
  'Mango.webp': 'icon_mango',
  'Calamansi.webp': 'icon_calamansi',
  'Bread.webp': 'icon_bread',
  'Seashells.webp': 'icon_seashells',
  'Clock-Face-3_00.webp': 'clock_face_3_00',
  'Clock-Face-7_30.webp': 'clock_face_7_30',
  'Clock-Face-10_00.webp': 'clock_face_10_00',
  'Bill50.webp': 'money_bill_50',
  'Bill100.webp': 'money_bill_100',
  'Bill500.webp': 'money_bill_500',
  'Bill1000.webp': 'money_bill_1000',
  'Coin1.webp': 'money_coin_1',
  'Coin5.webp': 'money_coin_5',
  'Coin10.webp': 'money_coin_10',
  'Coin20.webp': 'money_coin_20'
};

const main = () => {
  const content = fs.readFileSync(AUDIT_FILE, 'utf8');
  const sections = content.split('---');
  let updateCount = 0;

  sections.forEach(section => {
    const bankMatch = section.match(/## Bank: \[(.*?)\]/);
    if (!bankMatch) return;

    const relativeBankPath = bankMatch[1];
    const absoluteBankPath = path.join(CONTENT_DIR, relativeBankPath);

    if (!fs.existsSync(absoluteBankPath)) {
      console.warn(`Bank file not found: ${absoluteBankPath}`);
      return;
    }

    const bankJson = JSON.parse(fs.readFileSync(absoluteBankPath, 'utf8'));
    let bankModified = false;

    // Find Ready items: - [x] Question text... **(Ready: AssetName.webp)**
    const readyItems = section.matchAll(/- \[x\] (.*?) \*\*\(Ready: (.*?)\)\*\*/g);

    for (const match of readyItems) {
      const questionText = match[1].trim();
      const assetFile = match[2].trim();
      const assetId = ASSET_MAP[assetFile];

      if (!assetId) {
        console.warn(`No mapping for asset file: ${assetFile}`);
        continue;
      }

      // Find matching question in JSON
      const questionData = bankJson.questions.find(q => q.question.trim() === questionText);
      if (questionData) {
        questionData.assetId = assetId;
        bankModified = true;
        updateCount++;
      }
    }

    if (bankModified) {
      fs.writeFileSync(absoluteBankPath, JSON.stringify(bankJson, null, 4));
      console.log(`Updated bank: ${relativeBankPath}`);
    }
  });

  console.log(`Successfully integrated ${updateCount} assets into question banks.`);
};

main();
