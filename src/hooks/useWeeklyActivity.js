import { useMemo } from 'react';
import useUserStore from '@/stores/user-stores/useUserStore';
import { aggregateWeeklyXp } from '@/utils/activityAggregator';

/**
 * Weekly XP buckets for the Profile bar graph (local calendar days, rolling 7-day window).
 */
export default function useWeeklyActivity() {
  const xpSessionLog = useUserStore((s) => s.xpSessionLog ?? []);
  return useMemo(() => aggregateWeeklyXp(xpSessionLog), [xpSessionLog]);
}
