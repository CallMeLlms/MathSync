/**
 * Buckets XP session events into the last 7 local calendar days (oldest → newest).
 * Timestamps are stored as UTC ISO strings; bucketing uses the device's local timezone.
 *
 * @param {Array<{ timestampUtc: string, xp?: number }>} xpSessionLog
 * @param {Date} [now] - inject for tests
 * @returns {{
 *   days: Array<{ dateKey: string, dayLabel: string, xp: number, heightNormalized: number }>,
 *   maxDailyXp: number,
 *   yScale: number,
 *   isEmpty: boolean,
 *   weekTotalXp: number
 * }}
 */
export function aggregateWeeklyXp(xpSessionLog, now = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${dayNum}`;
    days.push({
      dateKey,
      date: d,
      dayLabel: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      xp: 0,
    });
  }

  const dateKeySet = new Set(days.map((x) => x.dateKey));

  for (const e of xpSessionLog || []) {
    const t = new Date(e.timestampUtc).getTime();
    if (Number.isNaN(t)) continue;

    const local = new Date(e.timestampUtc);
    const y = local.getFullYear();
    const m = String(local.getMonth() + 1).padStart(2, '0');
    const dayNum = String(local.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${dayNum}`;
    if (!dateKeySet.has(key)) continue;

    const bucket = days.find((d) => d.dateKey === key);
    if (bucket) bucket.xp += Math.max(0, Number(e.xp) || 0);
  }

  const maxDailyXp = Math.max(0, ...days.map((d) => d.xp));
  const scale = maxDailyXp > 0 ? maxDailyXp * 1.2 : 1;

  const daysOut = days.map((d) => ({
    dateKey: d.dateKey,
    dayLabel: d.dayLabel,
    xp: d.xp,
    heightNormalized: maxDailyXp > 0 ? d.xp / scale : 0,
  }));

  const weekTotalXp = days.reduce((sum, d) => sum + d.xp, 0);

  return {
    days: daysOut,
    maxDailyXp,
    yScale: scale,
    isEmpty: maxDailyXp === 0,
    weekTotalXp,
  };
}
