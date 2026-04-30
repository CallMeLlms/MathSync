import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import speechManager from '@/utils/speechManager';

export default function PreGameLoader({ theme }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animate = (sv, delay) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 }),
          ),
          -1,
          false,
        ),
      );
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);

    speechManager.speakInstruction(theme.loadingText);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.label, { color: theme.primaryColor, fontFamily: theme.fontFamily.title }]}>
        {theme.loadingText}
      </Text>
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { backgroundColor: theme.primaryColor }, dot1Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: theme.primaryColor }, dot2Style]} />
        <Animated.View style={[styles.dot, { backgroundColor: theme.primaryColor }, dot3Style]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  label: {
    fontSize: 28,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
