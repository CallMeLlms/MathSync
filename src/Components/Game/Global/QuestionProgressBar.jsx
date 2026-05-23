import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

export default function QuestionProgressBar({ currentIndex = 0, totalQuestions = 0, theme }) {
  const fillProgress = useSharedValue(0);
  const safeTotal = Math.max(Number(totalQuestions) || 0, 0);
  const currentQuestionNumber = safeTotal > 0
    ? Math.min(Math.max(currentIndex + 1, 1), safeTotal)
    : 0;
  const progressPercent = safeTotal > 0
    ? (currentQuestionNumber / safeTotal) * 100
    : 0;

  useEffect(() => {
    fillProgress.value = withTiming(progressPercent, { duration: 280 });
  }, [fillProgress, progressPercent]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value}%`,
  }));

  if (safeTotal <= 0) return null;

  return (
    <View style={styles.container}>
      <View style={{justifyContent: 'center', alignItems: 'center', marginBottom: 12}}>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.label,
            {
              color: theme.primaryColor,
              fontFamily: theme.fontFamily.accent,
            },
          ]}
          numberOfLines={1}
        >
          {/* Question {currentQuestionNumber} of {safeTotal} */}
        </Text>
      </View>
      
      
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: safeTotal,
            now: currentQuestionNumber,
          }}
        >
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: theme.primaryColor,
                borderBottomColor: Colors.onPrimaryContainer,
              },
              fillStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
    minWidth: 0,
    // backgroundColor: 'red'
  },
  labelRow: {
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  track: {
    width: '100%',
    height: 18,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    minWidth: 8,
    borderRightWidth: 2,
    borderRightColor: 'rgba(255,255,255,0.34)',
    borderBottomWidth: 4,
    borderRadius: 8,
  },
});
