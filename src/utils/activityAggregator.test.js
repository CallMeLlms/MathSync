import { aggregateWeeklyXp } from './activityAggregator';

describe('aggregateWeeklyXp', () => {
  const fixedNow = new Date(2026, 3, 13, 12, 0, 0);

  function localNoonOnCalendarDay(baseDate, daysFromBase) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + daysFromBase, 12, 0, 0);
    return d.toISOString();
  }

  it('sums XP into local calendar buckets for the rolling 7-day window', () => {
    const log = [
      { timestampUtc: localNoonOnCalendarDay(fixedNow, 0), xp: 30 },
      { timestampUtc: localNoonOnCalendarDay(fixedNow, -1), xp: 20 },
    ];
    const result = aggregateWeeklyXp(log, fixedNow);

    expect(result.weekTotalXp).toBe(50);
    expect(result.maxDailyXp).toBe(30);
    expect(result.isEmpty).toBe(false);

    const y = fixedNow.getFullYear();
    const m = String(fixedNow.getMonth() + 1).padStart(2, '0');
    const dToday = String(fixedNow.getDate()).padStart(2, '0');
    const todayKey = `${y}-${m}-${dToday}`;

    const yest = new Date(fixedNow.getFullYear(), fixedNow.getMonth(), fixedNow.getDate() - 1);
    const yk = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;

    const today = result.days.find((d) => d.dateKey === todayKey);
    const yesterday = result.days.find((d) => d.dateKey === yk);
    expect(today.xp).toBe(30);
    expect(yesterday.xp).toBe(20);
  });

  it('returns isEmpty and zero heights when there is no XP in the window', () => {
    const result = aggregateWeeklyXp([], fixedNow);
    expect(result.isEmpty).toBe(true);
    expect(result.weekTotalXp).toBe(0);
    expect(result.days).toHaveLength(7);
    result.days.forEach((d) => {
      expect(d.xp).toBe(0);
      expect(d.heightNormalized).toBe(0);
    });
  });

  it('ignores events outside the 7-day window', () => {
    const log = [{ timestampUtc: localNoonOnCalendarDay(fixedNow, -10), xp: 999 }];
    const result = aggregateWeeklyXp(log, fixedNow);
    expect(result.weekTotalXp).toBe(0);
    expect(result.isEmpty).toBe(true);
  });

  it('normalizes bar heights using max daily XP times 1.2', () => {
    const log = [{ timestampUtc: localNoonOnCalendarDay(fixedNow, 0), xp: 24 }];
    const result = aggregateWeeklyXp(log, fixedNow);
    const y = fixedNow.getFullYear();
    const m = String(fixedNow.getMonth() + 1).padStart(2, '0');
    const dToday = String(fixedNow.getDate()).padStart(2, '0');
    const todayKey = `${y}-${m}-${dToday}`;
    const today = result.days.find((d) => d.dateKey === todayKey);
    expect(today.heightNormalized).toBeCloseTo(24 / (24 * 1.2), 5);
  });
});
