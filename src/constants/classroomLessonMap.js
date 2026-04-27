// Layer 1: Explicit ObjectId → gameLesson map
// Fill in each _id from the MongoDB classroom lesson documents.
// Format: '<MongoDB _id string>': <gameLesson number>
const OBJECT_ID_MAP = {
  // Q1
  '69d36053d4917097e571d497': 3, // Maps to Lesson 3 (Ranking Vines)
  '69d3606ad4917097e571d4f8': null, // TODO
  '69d8ae56e2515f832fd20ac4': 3, // Maps to Lesson 3 (Confirmed via Debug)
  '69cf79031f6f65e4e48e8dde': 1, // TODO
  // Q2
  '69d254dd2c211e0f5162f156': 1, // TODO
  '69d7b3dd502dbe1c22728648': 2, // TODO
  '69d8c01113b3028a6109fd5f': 4, // TODO
  '69d8c0b013b3028a6109fd74': 2, // TODO
  // Add remaining lesson _ids here as you identify them
};

// Layer 2: Keyword fallback map (quarter-scoped)
// Used only when a lesson _id is not in OBJECT_ID_MAP.
const KEYWORD_MAP = [
  // Q1
  { quarter: 1, keywords: ['shape', 'flat', 'circle', 'square', 'triangle', 'rectangle', 'geometric', '2d'], gameLesson: 1 },
  { quarter: 1, keywords: ['pairing', 'petal', 'number sense', 'whole number', 'counting'], gameLesson: 2 },
  { quarter: 1, keywords: ['ordinal', 'ranking', 'vine', 'position', 'order', 'first', 'second'], gameLesson: 3 },
  { quarter: 1, keywords: ['sort', 'compare', 'seed', 'greater', 'less', 'smallest', 'largest'], gameLesson: 4 },
  // Q2
  { quarter: 2, keywords: ['measure', 'length', 'distance', 'meadow', 'non-standard', 'longer', 'shorter'], gameLesson: 6 },
  { quarter: 2, keywords: ['hundred', 'count to 100', 'skip count', 'vine', 'numbers to 100'], gameLesson: 7 },
  { quarter: 2, keywords: ['place value', 'tens', 'ones', 'pond', 'decompose', 'digit'], gameLesson: 8 },
  { quarter: 2, keywords: ['addition', 'add', 'grove', 'sum', 'adding'], gameLesson: 9 },
  // Q3 — Lesson 13 (to 100) BEFORE Lesson 12 (to 20) so the more specific match wins first
  { quarter: 3, keywords: ['data', 'graph', 'pictograph', 'tally', 'chart', 'garden'], gameLesson: 11 },
  { quarter: 3, keywords: ['subtraction', 'subtract', 'root', 'to 100', 'two-digit', 'two digit', '100'], gameLesson: 13 },
  { quarter: 3, keywords: ['subtraction', 'subtract', 'spring', 'minus', 'take away', 'to 20', 'difference'], gameLesson: 12 },
  { quarter: 3, keywords: ['pattern', 'trail', 'repeat', 'sequence', 'repeating', 'what comes next'], gameLesson: 14 },
  // Q4
  { quarter: 4, keywords: ['fraction', 'flower', 'half', 'halves', 'third', 'thirds', 'fourth', 'fourths', 'quarter', 'quarters', 'equal part', 'equal parts', 'sharing'], gameLesson: 16 },
  { quarter: 4, keywords: ['money', 'peso', 'coin', 'bill', 'market', 'centavo', 'currency'], gameLesson: 17 },
  { quarter: 4, keywords: ['clock', 'time', 'hour', 'minute', 'tower', 'analog', 'telling time', "o'clock", 'half past'], gameLesson: 18 },
  { quarter: 4, keywords: ['calendar', 'day', 'month', 'compass', 'direction', 'days of the week', 'rotation', 'turn'], gameLesson: 19 },
];

export function resolveGameLesson(lessonId, title = '', quarter = null) {
  // Layer 1: explicit ObjectId match
  const idStr = lessonId?.toString().trim();
  if (idStr && idStr in OBJECT_ID_MAP) {
    return OBJECT_ID_MAP[idStr];
  }

  // Layer 2: keyword fallback
  const lower = title.toLowerCase();
  const candidates = quarter ? KEYWORD_MAP.filter(e => e.quarter === quarter) : KEYWORD_MAP;
  const match = candidates.find(entry => entry.keywords.some(kw => lower.includes(kw)));
  return match ? match.gameLesson : null;
}
