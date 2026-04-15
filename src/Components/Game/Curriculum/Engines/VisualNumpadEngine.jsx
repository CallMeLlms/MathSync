/**
 * VisualNumpadEngine — Grade 1 Visual/Pictorial Counting Engine
 *
 * For concrete/pictorial number questions where the child needs a visual
 * group to count before typing the answer. Sits between NumpadEngine
 * (pure-equation input) and word problems (no visual).
 *
 * Visual zone resolves from `data.metadata`:
 *   - `addends: [a, b]` → two groups of the same assetId, separated by "+"
 *   - `group_a` + `group_b` → red-tinted group A + blue-tinted group B
 *   - `count: N` → N tiles of the assetId
 *   - else (assetId only) → single context tile
 *
 * Props Contract: { data, onResult }
 * Shadow-Free Design System compliant.
 */

import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  ZoomIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const KEY_COLORS = [
  '#FF7043', '#42A5F5', '#66BB6A', '#AB47BC', '#FFA726',
  '#26C6DA', '#EF5350', '#5C6BC0', '#8D6E63', '#78909C',
];

// Tinted tile backgrounds for group differentiation
const TILE_BG_A = 'rgba(239,83,80,0.12)';
const TILE_BORDER_A = 'rgba(239,83,80,0.35)';
const TILE_BG_B = 'rgba(66,165,245,0.12)';
const TILE_BORDER_B = 'rgba(66,165,245,0.35)';
const TILE_BG_NEUTRAL = Colors.surfaceContainerLowest;
const TILE_BORDER_NEUTRAL = Colors.outlineVariant;

// ─── NumpadKey ───
const NumpadKey = ({ value, onPress, disabled, color, index }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.85, { damping: 8, stiffness: 400 }); })
    .onEnd(() => { runOnJS(onPress)(value); })
    .onFinalize(() => { scale.value = withSpring(1, { damping: 10, stiffness: 300 }); })
    .enabled(!disabled);

  return (
    <Animated.View entering={ZoomIn.springify().delay(index * 40)}>
      <Animated.View style={animatedStyle}>
        <GestureDetector gesture={tap}>
          <Animated.View
            style={[
              styles.numKey,
              { backgroundColor: color, opacity: disabled ? 0.35 : 1 },
            ]}
          >
            <Text style={styles.numKeyText}>{value}</Text>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Blinking Cursor ───
const BlinkingCursor = () => {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.cursor, animatedStyle]} />;
};

// ─── VisualTile ───
const VisualTile = ({ assetId, index, tone }) => {
  const toneStyle =
    tone === 'a' ? { backgroundColor: TILE_BG_A, borderColor: TILE_BORDER_A } :
    tone === 'b' ? { backgroundColor: TILE_BG_B, borderColor: TILE_BORDER_B } :
                   { backgroundColor: TILE_BG_NEUTRAL, borderColor: TILE_BORDER_NEUTRAL };

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 35)}
      style={[styles.visualTile, toneStyle]}
    >
      <AssetDisplay assetId={assetId} style={styles.visualTileAsset} />
    </Animated.View>
  );
};

// ─── PlusSeparator ───
const PlusSeparator = () => (
  <Animated.View entering={FadeIn.delay(200)} style={styles.plusSeparator}>
    <Text style={styles.plusText}>+</Text>
  </Animated.View>
);

// ─── VisualNumpadEngine ───
const VisualNumpadEngine = ({ data, onResult }) => {
  const { answer, maxDigits = 2, assetId, metadata = {} } = data;
  const { addends, group_a, group_b, count } = metadata;

  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  useEffect(() => {
    setInput('');
    setAnswered(false);
    setIsWrong(false);
  }, [data]);

  // Speak instruction on load
  useEffect(() => {
    const text = data?.question;
    if (!text) return undefined;
    const timer = setTimeout(() => speechManager.speakInstruction(text), 400);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [data?.question]);

  const displayScale = useSharedValue(1);
  const displayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: displayScale.value }],
  }));

  const handleKeyPress = (digit) => {
    if (answered || input.length >= maxDigits) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWrong(false);
    setInput(input + String(digit));
    displayScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 400 }),
      withSpring(1.0, { damping: 12, stiffness: 300 })
    );
  };

  const handleBackspace = () => {
    if (answered || input.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWrong(false);
    setInput(input.slice(0, -1));
  };

  const handleCheckAnswer = () => {
    if (input.length === 0 || answered) return;
    const userAnswer = parseInt(input, 10);
    const correctAnswer = typeof answer === 'number' ? answer : parseInt(answer, 10);
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      setAnswered(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
      setTimeout(() => onResult(true, [input]), 600);
    } else {
      setIsWrong(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      onResult(false, [input]);
      setTimeout(() => {
        setInput('');
        setIsWrong(false);
      }, 1000);
    }
  };

  // Build visual group model — which tiles to render
  const visualGroups = useMemo(() => {
    // Two groups via addends (same assetId for both)
    if (Array.isArray(addends) && addends.length === 2) {
      const iconA = assetId || 'icon_star';
      return {
        mode: 'two-group',
        a: Array.from({ length: addends[0] }, () => iconA),
        b: Array.from({ length: addends[1] }, () => iconA),
      };
    }
    // Two groups via group_a / group_b (red + blue blocks)
    if (typeof group_a === 'number' && typeof group_b === 'number') {
      return {
        mode: 'two-group',
        a: Array.from({ length: group_a }, () => 'icon_block_red'),
        b: Array.from({ length: group_b }, () => 'icon_block_blue'),
      };
    }
    // Plain count of tiles
    if (typeof count === 'number' && count > 0) {
      const icon = assetId || 'icon_block_orange';
      return {
        mode: 'count',
        tiles: Array.from({ length: count }, () => icon),
      };
    }
    // Single context asset
    if (assetId) {
      return { mode: 'single', tiles: [assetId] };
    }
    return { mode: 'none' };
  }, [addends, group_a, group_b, count, assetId]);

  const getInstruction = () => {
    if (answered) return '✅ Correct!';
    if (isWrong) return 'Not quite — try again!';
    if (input.length > 0) return 'Tap Check when ready.';
    return 'Count carefully, then type your answer.';
  };

  const renderVisualZone = () => {
    if (visualGroups.mode === 'two-group') {
      return (
        <View style={styles.visualRow}>
          <View style={styles.groupBox}>
            {visualGroups.a.map((id, i) => (
              <VisualTile key={`a-${i}`} assetId={id} index={i} tone="a" />
            ))}
          </View>
          <PlusSeparator />
          <View style={styles.groupBox}>
            {visualGroups.b.map((id, i) => (
              <VisualTile key={`b-${i}`} assetId={id} index={i} tone="b" />
            ))}
          </View>
        </View>
      );
    }
    if (visualGroups.mode === 'count') {
      return (
        <View style={styles.countBox}>
          {visualGroups.tiles.map((id, i) => (
            <VisualTile key={`c-${i}`} assetId={id} index={i} tone="neutral" />
          ))}
        </View>
      );
    }
    if (visualGroups.mode === 'single') {
      return (
        <View style={styles.singleBox}>
          <AssetDisplay assetId={visualGroups.tiles[0]} style={styles.singleAsset} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Visual Group Zone */}
      <Animated.View entering={FadeInDown.springify().delay(100)} style={styles.visualCard}>
        {renderVisualZone()}
      </Animated.View>

      {/* Answer Box */}
      <Animated.View
        entering={FadeIn.delay(150)}
        style={[styles.answerBox, displayStyle, isWrong && styles.answerBoxWrong, answered && styles.answerBoxCorrect]}
      >
        {input.length > 0 ? (
          <Text style={[styles.answerText, answered && styles.answerTextCorrect]}>
            {input}
          </Text>
        ) : (
          <BlinkingCursor />
        )}
      </Animated.View>

      {/* Instruction */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        style={[
          styles.instructionText,
          isWrong && { color: Colors.error },
          answered && { color: Colors.success },
        ]}
      >
        {getInstruction()}
      </Animated.Text>

      {/* Number Pad */}
      <Animated.View entering={FadeInUp.springify().delay(150)} style={styles.numpadContainer}>
        <View style={styles.numpadRow}>
          {[1, 2, 3, 4, 5].map((n, i) => (
            <NumpadKey
              key={`key-${n}`}
              value={n}
              index={i}
              color={KEY_COLORS[n - 1]}
              onPress={handleKeyPress}
              disabled={answered || input.length >= maxDigits}
            />
          ))}
        </View>
        <View style={styles.numpadRow}>
          {[6, 7, 8, 9, 0].map((n, i) => (
            <NumpadKey
              key={`key-${n}`}
              value={n}
              index={i + 5}
              color={KEY_COLORS[n === 0 ? 9 : n - 1]}
              onPress={handleKeyPress}
              disabled={answered || input.length >= maxDigits}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          <GestureDetector
            gesture={Gesture.Tap()
              .onEnd(() => runOnJS(handleBackspace)())
              .enabled(!answered && input.length > 0)}
          >
            <Animated.View
              style={[
                styles.actionButton,
                styles.backspaceButton,
                { opacity: input.length === 0 || answered ? 0.4 : 1 },
              ]}
            >
              <Ionicons name="backspace-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </Animated.View>
          </GestureDetector>

          {input.length > 0 && !answered && (
            <GestureDetector
              gesture={Gesture.Tap().onEnd(() => runOnJS(handleCheckAnswer)())}
            >
              <Animated.View entering={ZoomIn.springify()} style={[styles.actionButton, styles.submitButton]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Check</Text>
              </Animated.View>
            </GestureDetector>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const TILE_SIZE = SCREEN_WIDTH * 0.12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  visualCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.14,
  },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: SCREEN_WIDTH * 0.38,
  },
  countBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  singleBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleAsset: {
    width: SCREEN_HEIGHT * 0.12,
    height: SCREEN_HEIGHT * 0.12,
  },
  visualTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  visualTileAsset: {
    width: '100%',
    height: '100%',
  },
  plusSeparator: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.032,
    color: Colors.onSurfaceVariant,
  },
  answerBox: {
    minWidth: SCREEN_WIDTH * 0.28,
    minHeight: SCREEN_HEIGHT * 0.07,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderStyle: 'dashed',
  },
  answerBoxWrong: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(186,26,26,0.08)',
    borderStyle: 'solid',
  },
  answerBoxCorrect: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(0,110,42,0.08)',
    borderStyle: 'solid',
  },
  answerText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.042,
    color: Colors.onSurface,
  },
  answerTextCorrect: {
    color: Colors.success,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.016,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cursor: {
    width: 3,
    height: SCREEN_HEIGHT * 0.04,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  numpadContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  numKey: {
    width: (SCREEN_WIDTH - 96) / 5,
    height: (SCREEN_WIDTH - 96) / 5,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.032,
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 20,
  },
  backspaceButton: {
    backgroundColor: Colors.secondary,
  },
  submitButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.017,
    color: '#FFFFFF',
  },
});

export default VisualNumpadEngine;
