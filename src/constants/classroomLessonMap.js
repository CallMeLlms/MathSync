const LESSON_MAP = [
  // Q1
  { quarter: 1, keywords: ['shape', 'flat', 'circle', 'square', 'triangle', 'rectangle', 'geometric'], gameLesson: 1 },
  { quarter: 1, keywords: ['number', 'addition', 'pairing', 'petal', 'counting', 'whole'],             gameLesson: 2 },
  { quarter: 1, keywords: ['ordinal', 'ranking', 'position', 'first', 'second', 'vine', 'order'],      gameLesson: 3 },
  { quarter: 1, keywords: ['sort', 'compare', 'seed', 'greater', 'less'],                              gameLesson: 4 },
  // Q2
  { quarter: 2, keywords: ['measure', 'length', 'distance', 'meadow', 'non-standard'],                 gameLesson: 6 },
  { quarter: 2, keywords: ['hundred', 'count to 100', 'skip count', 'vine'],                           gameLesson: 7 },
  { quarter: 2, keywords: ['place value', 'tens', 'ones', 'pond', 'decompose'],                        gameLesson: 8 },
  { quarter: 2, keywords: ['addition', 'add', 'grove', 'sum'],                                         gameLesson: 9 },
  // Q3
  { quarter: 3, keywords: ['data', 'graph', 'pictograph', 'table', 'garden'],                          gameLesson: 11 },
  { quarter: 3, keywords: ['subtraction', 'subtract', 'spring', 'minus', 'take away', 'to 20'],        gameLesson: 12 },
  { quarter: 3, keywords: ['subtraction', 'subtract', 'root', 'to 100'],                               gameLesson: 13 },
  { quarter: 3, keywords: ['pattern', 'trail', 'repeat', 'sequence'],                                  gameLesson: 14 },
  // Q4
  { quarter: 4, keywords: ['fraction', 'flower', 'half', 'equal part'],                                gameLesson: 16 },
  { quarter: 4, keywords: ['money', 'peso', 'coin', 'bill', 'market'],                                 gameLesson: 17 },
  { quarter: 4, keywords: ['clock', 'time', 'hour', 'minute', 'tower'],                                gameLesson: 18 },
  { quarter: 4, keywords: ['calendar', 'day', 'month', 'compass', 'direction'],                        gameLesson: 19 },
];

export function resolveGameLesson(title = '', quarter = null) {
  const lower = title.toLowerCase();
  const candidates = quarter ? LESSON_MAP.filter(e => e.quarter === quarter) : LESSON_MAP;
  const match = candidates.find(entry => entry.keywords.some(kw => lower.includes(kw)));
  return match ? match.gameLesson : null;
}
