import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

const WEEKLY_DATA = [
  { day: 'M', value: 0.4 },
  { day: 'T', value: 0.7 },
  { day: 'W', value: 0.5 },
  { day: 'T', value: 0.9 },
  { day: 'F', value: 0.3 },
  { day: 'S', value: 0.8 },
  { day: 'S', value: 0.6 },
];

const Bar = ({ day, value, delay }) => {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(value * 100, {
      duration: 1000,
      delay: delay,
      easing: Easing.out(Easing.exp),
    });
  }, [value, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`,
  }));

  return (
    <View style={styles.barWrapper}>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
      <Text style={styles.dayText}>{day}</Text>
    </View>
  );
};

export default function ProfileBarGraph() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      <View style={styles.graphContent}>
        {WEEKLY_DATA.map((item, index) => (
          <Bar 
            key={index} 
            day={item.day} 
            value={item.value} 
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
    marginBottom: 32, // Increased from 20 to 32
  },
  graphContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150, // Fixed height for the graph area
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
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
