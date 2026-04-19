import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import useWeeklyActivity from '@/hooks/useWeeklyActivity';

function Bar({ dayLabel, heightNormalized, delay, xp }) {
  const height = useSharedValue(0);

  useEffect(() => {
    const pct = Math.min(100, Math.max(0, heightNormalized * 100));
    height.value = withTiming(pct, {
      duration: 1000,
      delay: delay,
      easing: Easing.out(Easing.exp),
    });
  }, [heightNormalized, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`,
  }));

  return (
    <View style={styles.barWrapper}>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
      <Text style={styles.barValue}>{xp > 0 ? xp : ''}</Text>
      <Text style={styles.dayText} numberOfLines={1}>
        {dayLabel}
      </Text>
    </View>
  );
}

export default function ProfileBarGraph() {
  const { days, isEmpty, weekTotalXp, maxDailyXp } = useWeeklyActivity();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>This week</Text>
          <Text style={styles.title}>XP progress</Text>
        </View>
      </View>
      {isEmpty ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptyText}>
            Play a lesson and your weekly progress will stack up here.
          </Text>
        </View>
      ) : (
        <></>
      )}
      <View style={styles.graphContent}>
        {days.map((item, index) => (
          <Bar
            key={item.dateKey}
            dayLabel={item.dayLabel}
            heightNormalized={item.heightNormalized}
            delay={index * 100}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 26,
    borderWidth: 2,
    borderBottomWidth: 8,
    borderColor: Colors.outlineVariant,
    marginTop: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.onSurfaceVariant,
  },
  title: {
    marginTop: 3,
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
  },
  summaryPill: {
    minWidth: 82,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'Lexend-Black',
    fontSize: 22,
    color: Colors.primary,
  },
  summaryLabel: {
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  supportingText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  emptyText: {
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  graphContent: {
    marginTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 196,
    paddingTop: 4,
    paddingBottom: 6,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barValue: {
    minHeight: 14,
    marginTop: 8,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  barTrack: {
    width: 24,
    height: '100%',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: Colors.outlineVariant,
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  dayText: {
    fontFamily: 'PlusJakartaSans-bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.onSurfaceVariant,
    maxWidth: '100%',
    textAlign: 'center',
  },
});
