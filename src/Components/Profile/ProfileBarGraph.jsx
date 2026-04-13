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

function Bar({ dayLabel, heightNormalized, delay }) {
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
      <Text style={styles.dayText} numberOfLines={1}>
        {dayLabel}
      </Text>
    </View>
  );
}

export default function ProfileBarGraph() {
  const { days, isEmpty } = useWeeklyActivity();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      {isEmpty ? (
        <Text style={styles.emptyText}>
          No XP logged this week yet. Play a lesson and your progress will show up here.
        </Text>
      ) : null}
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
    padding: 24,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 20,
  },
  graphContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 12,
    height: '100%',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  dayText: {
    marginTop: 8,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    maxWidth: '100%',
    textAlign: 'center',
  },
});
