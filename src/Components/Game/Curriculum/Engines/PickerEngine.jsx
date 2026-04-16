/**
 * PickerEngine — Multiple-Choice Visual Tile Engine
 *
 * Renders a 2-column grid of large tappable option tiles.
 * Correct tap: green border + checkmark, auto-advance after 600ms.
 * Wrong tap: red flash for 600ms, reset — student can retry.
 * No "Check" button — feedback is immediate on tap.
 *
 * Data contract (from Orchestrator `data` prop):
 *   {
 *     question: "Which shape has 4 corners?",
 *     answer: "square" | 4,
 *     metadata: { options: ["square", "circle", "triangle"] }
 *   }
 *
 * Props: { data, onResult } (standard Orchestrator API)
 */

import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OPTION_COLORS = [
  '#FF7043', '#42A5F5', '#66BB6A', '#AB47BC',
  '#FFA726', '#26C6DA', '#EF5350', '#5C6BC0',
];

// ─── OptionTile ───
// state: 'idle' | 'correct' | 'wrong'
const OptionTile = ({ label, color, index, state, disabled, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9, { damping: 8, stiffness: 400 });
    })
    .onEnd(() => {
      runOnJS(onPress)(label);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    })
    .enabled(!disabled);

  const borderColor =
    state === 'correct' ? Colors.success :
    state === 'wrong'   ? Colors.error :
                          Colors.outlineVariant;

  const bgColor =
    state === 'correct' ? 'rgba(76,175,80,0.15)' :
    state === 'wrong'   ? 'rgba(211,47,47,0.12)' :
                          Colors.surfaceContainerLowest;

  const textColor =
    state === 'correct' ? Colors.success :
    state === 'wrong'   ? Colors.error :
                          Colors.onSurface;

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 80)}
      style={styles.tileWrapper}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <GestureDetector gesture={tap}>
          <Animated.View
            style={[
              styles.optionTile,
              {
                backgroundColor: bgColor,
                borderColor,
                borderWidth: state !== 'idle' ? 3 : 2,
              },
            ]}
          >
            <View style={[styles.colorBar, { backgroundColor: color }]} />
            <Text
              style={[styles.optionText, { color: textColor }]}
              numberOfLines={3}
              adjustsFontSizeToFit
            >
              {String(label)}
            </Text>
            {state === 'correct' && (
              <Animated.View entering={ZoomIn.springify()} style={styles.resultBadge}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              </Animated.View>
            )}
            {state === 'wrong' && (
              <Animated.View entering={ZoomIn.springify()} style={styles.resultBadge}>
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </Animated.View>
            )}
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Animated.View>
  );
};

// ─── PickerEngine ───
const PickerEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const options = metadata.options || [];

  // Per-option state keyed by stringified option value
  const [tileStates, setTileStates] = useState({});
  const [resolved, setResolved] = useState(false);

  // Shuffle options once per question
  const shuffledOptions = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  // Reset on question change
  useEffect(() => {
    setTileStates({});
    setResolved(false);
  }, [data]);

  // Speak the question
  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => { clearTimeout(timer); speechManager.stop(); };
    }
  }, [questionText]);

  const handleTap = (option) => {
    if (resolved) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const key = String(option);
    const normalizedSelected = key.toLowerCase().trim();
    const normalizedAnswer = String(answer).toLowerCase().trim();
    const isCorrect = normalizedSelected === normalizedAnswer;

    if (isCorrect) {
      setTileStates({ [key]: 'correct' });
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [key]), 600);
    } else {
      setTileStates(prev => ({ ...prev, [key]: 'wrong' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setTileStates(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 600);
    }
  };

  const getInstruction = () => {
    if (resolved) return '✅ Correct!';
    return 'Tap your answer.';
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Instruction Hint */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
        <Animated.Text
          style={[
            styles.instructionText,
            resolved && { color: Colors.success },
          ]}
        >
          {getInstruction()}
        </Animated.Text>
      </Animated.View>

      {/* 2-column options grid */}
      <View style={styles.optionsGrid}>
        {shuffledOptions.map((opt, idx) => {
          const key = String(opt);
          const state = tileStates[key] || 'idle';
          return (
            <OptionTile
              key={`opt-${idx}`}
              label={opt}
              color={OPTION_COLORS[idx % OPTION_COLORS.length]}
              index={idx}
              state={state}
              disabled={resolved || state === 'wrong'}
              onPress={handleTap}
            />
          );
        })}
      </View>
    </View>
  );
};

const TILE_HEIGHT = SCREEN_HEIGHT * 0.13;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  hintContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.015,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  tileWrapper: {
    width: '47%',
    height: TILE_HEIGHT,
  },
  optionTile: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
    position: 'relative',
  },
  colorBar: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  optionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.022,
    textAlign: 'center',
    flexShrink: 1,
  },
  resultBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default PickerEngine;
