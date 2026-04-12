const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, 'question_bank_audit.md');

const ASSETS = {
  shapes: {
    'triangle': 'TriangleShape.webp',
    'rectangle': 'RectangleShpae.webp',
    'square': 'SquareShape.webp',
    'circle': 'CircleShape.webp'
  },
  food: {
    'bread': 'Bread.webp',
    'calamansi': 'Calamansi.webp',
    'mango': 'Mango.webp',
    'seashell': 'Seashells.webp'
  },
  money: {
    '₱1': 'Coin1.webp',
    '₱5': 'Coin5.webp',
    '₱10': 'Coin10.webp',
    '₱20': 'Coin20.webp',
    '₱50': 'Bill50.webp',
    '₱100': 'Bill100.webp',
    '₱500': 'Bill500.webp',
    '₱1000': 'Bill1000.webp',
    '20 Peso': 'Coin20.webp'
  },
  clocks: {
    '3 o\'clock': 'Clock-Face-3_00.webp',
    '3:00': 'Clock-Face-3_00.webp',
    '7:30': 'Clock-Face-7_30.webp',
    '10:00': 'Clock-Face-10_00.webp'
  }
};

const matchAsset = (text) => {
  const lowerText = text.toLowerCase();
  
  // High priority specific matches
  for (const [key, val] of Object.entries(ASSETS.clocks)) {
    if (lowerText.includes(key.toLowerCase())) return `Ready: ${val}`;
  }
  for (const [key, val] of Object.entries(ASSETS.money)) {
    if (lowerText.includes(key.toLowerCase())) return `Ready: ${val}`;
  }
  for (const [key, val] of Object.entries(ASSETS.food)) {
    if (lowerText.includes(key.toLowerCase())) return `Ready: ${val}`;
  }
  for (const [key, val] of Object.entries(ASSETS.shapes)) {
    if (lowerText.includes(key.toLowerCase())) return `Ready: ${val}`;
  }

  // Generic category matches
  if (lowerText.includes('clock') || lowerText.includes('time')) return 'TODO: New Clock Face Required';
  if (lowerText.includes('peso') || lowerText.includes('coin') || lowerText.includes('₱')) return 'TODO: Specific Currency Asset Required';
  
  // Missing common items
  if (lowerText.includes('bird')) return 'TODO: Bird Icon Required';
  if (lowerText.includes('duck')) return 'TODO: Duck Icon Required';
  if (lowerText.includes('car')) return 'TODO: Toy Car Icon Required';
  if (lowerText.includes('pencil')) return 'TODO: Pencil Icon Required';
  if (lowerText.includes('block')) return 'TODO: Base-10 Blocks / Cubes Required';
  if (lowerText.includes('stick') || lowerText.includes('bundle')) return 'TODO: Sticks/Bundles Required';
  if (lowerText.includes('cookie')) return 'TODO: Cookie Icon Required';
  if (lowerText.includes('fruit') || lowerText.includes('apple') || lowerText.includes('banana')) return 'TODO: Generic Fruit Assets Required';
  if (lowerText.includes('star')) return 'TODO: Star Icon Required';
  if (lowerText.includes('arrow')) return 'TODO: Arrow Icon Required';
  if (lowerText.includes('ribbon')) return 'TODO: Ribbon Visual Required';
  if (lowerText.includes('animal') || lowerText.includes('giraffe') || lowerText.includes('elephant')) return 'TODO: Animal Icons Required';

  return 'TODO: Missing Visual Asset';
};

const main = () => {
  const content = fs.readFileSync(AUDIT_FILE, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let isVisualSection = false;

  lines.forEach(line => {
    if (line.startsWith('#### SVG / Visual Questions')) {
      isVisualSection = true;
      newLines.push(line);
      return;
    }
    if (line.startsWith('#### Text-Only Questions') || line.startsWith('### Topic:') || line.startsWith('---')) {
      isVisualSection = false;
    }

    if (isVisualSection && line.trim().startsWith('- ')) {
      const question = line.trim().substring(2);
      const status = matchAsset(question);
      const checkbox = status.startsWith('Ready') ? '[x]' : '[ ]';
      newLines.push(`- ${checkbox} ${question} **(${status})**`);
    } else {
      newLines.push(line);
    }
  });

  fs.writeFileSync(AUDIT_FILE, newLines.join('\n'));
  console.log('Successfully transformed audit to TODO list.');
};

main();
