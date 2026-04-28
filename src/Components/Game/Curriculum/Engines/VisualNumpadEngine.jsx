/**
 * VisualNumpadEngine — Grade 1 Visual/Pictorial Counting Engine
 *
 * For concrete/pictorial number questions where the child needs a visual
 * group to count before typing the answer. Sits between NumpadEngine
 * (pure-equation input) and word problems (no visual).
 *
 * Visual zone resolves from `data.metadata`:
 *   - `sequence: [2, 4, null, 8]` → horizontal row of number cards; null = dashed blank
 *   - `addends: [a, b]` → two groups of the same assetId, separated by "+"
 *   - `group_a` + `group_b` → red-tinted group A + blue-tinted group B
 *   - `count: N` → N tiles of the assetId
 *   - else (assetId only) → single context tile
 *
 * Props Contract: { data, onResult }
 * Shadow-Free Design System compliant.
 */

import { View, Text, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Engagement-focused rainbow colors with depth awareness
const KEY_COLORS = [
  { base: '#FF7043', dark: '#E64A19' }, // Orange
  { base: '#42A5F5', dark: '#1976D2' }, // Blue
  { base: '#66BB6A', dark: '#388E3C' }, // Green
  { base: '#AB47BC', dark: '#7B1FA2' }, // Purple
  { base: '#FFA726', dark: '#F57C00' }, // Amber
  { base: '#26C6DA', dark: '#0097A7' }, // Cyan
  { base: '#EF5350', dark: '#D32F2F' }, // Red
  { base: '#5C6BC0', dark: '#303F9F' }, // Indigo
  { base: '#8D6E63', dark: '#5D4037' }, // Brown
  { base: '#78909C', dark: '#455A64' }, // Blue Grey
];

// ─── NumpadKey (Bulky Style) ───
const NumpadKey = ({ value, onPress, disabled, colorPair, index }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View 
      entering={ZoomIn.springify().delay(index * 40)}
      style={styles.numKeyWrapper}
    >
      <Pressable
        onPress={() => onPress(value)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.numKey,
            animatedStyle,
            { 
              backgroundColor: colorPair.base, 
              borderColor: colorPair.dark,
              opacity: disabled ? 0.35 : 1 
            },
          ]}
        >
          <Text style={styles.numKeyText}>{value}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── BulkyButton (Custom internal button) ───
const BulkyButton = ({ label, icon, onPress, disabled, type = 'secondary', style }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(5);

  const colors = {
    primary: {
      bg: Colors.tertiary,
      border: '#004d1e',
      text: '#fff',
    },
    secondary: {
      bg: Colors.surface,
      border: Colors.outlineVariant,
      text: Colors.onSurface,
    },
    danger: {
      bg: Colors.secondary,
      border: '#003a8c',
      text: '#fff',
    }
  }[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(3);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    bottomWidth.value = withSpring(5);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[{ flex: 1 }, style]}
    >
      <Animated.View
        style={[
          styles.bulkyBtn,
          animatedStyle,
          { backgroundColor: colors.bg, borderColor: colors.border },
          disabled && styles.disabledBtn
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={disabled ? Colors.onSurfaceVariant : colors.text} />}
        <Text style={[
          styles.bulkyBtnText, 
          { color: colors.text },
          disabled && { color: Colors.onSurfaceVariant, opacity: 0.5 }
        ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── Blinking Cursor ───
const BlinkingCursor = () => {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withSpring(1); // placeholder implementation for simplicity in overhaul
  }, []);
  return <View style={styles.cursor} />;
};

// ─── VisualTile ───
const VisualTile = ({ assetId, index, tone }) => {
  const toneColors =
    tone === 'a' ? { bg: 'rgba(239,83,80,0.08)', border: 'rgba(239,83,80,0.2)' } :
    tone === 'b' ? { bg: 'rgba(66,165,245,0.08)', border: 'rgba(66,165,245,0.2)' } :
                   { bg: Colors.surface, border: Colors.outlineVariant };

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 35)}
      style={[styles.visualTile, { backgroundColor: toneColors.bg, borderColor: toneColors.border }]}
    >
      <AssetDisplay assetId={assetId} style={styles.visualTileAsset} />
    </Animated.View>
  );
};

// ─── SequenceCard — one box in the number sequence row ───
const SequenceCard = ({ value, index }) => (
  <Animated.View
    entering={ZoomIn.springify().delay(index * 60)}
    style={[styles.seqCard, value === null && styles.seqCardBlank]}
  >
    <Text style={[styles.seqCardText, value === null && { color: Colors.onSecondaryContainer }]}>
      {value === null ? '?' : value}
    </Text>
  </Animated.View>
);

// ─── VisualNumpadEngine ───
const VisualNumpadEngine = ({ data, onResult }) => {
  const { answer, maxDigits = 2, assetId, metadata = {} } = data;
  const { addends, group_a, group_b, count, sequence } = metadata;

  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  useEffect(() => {
    setInput('');
    setAnswered(false);
    setIsWrong(false);
  }, [data]);

  useEffect(() => {
    const text = data?.question;
    if (!text) return undefined;
    const timer = setTimeout(() => speechManager.speakInstruction(text), 400);
    return () => { clearTimeout(timer); speechManager.stop(); };
  }, [data?.question]);

  const handleKeyPress = (digit) => {
    if (answered || input.length >= maxDigits) return;
    setIsWrong(false);
    setInput(prev => prev + String(digit));
  };

  const handleBackspace = () => {
    if (answered || input.length === 0) return;
    setIsWrong(false);
    setInput(prev => prev.slice(0, -1));
  };

  const handleCheckAnswer = () => {
    if (input.length === 0 || answered) return;
    const userAnswer = parseInt(input, 10);
    const correctAnswer = parseInt(answer, 10);
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
      setTimeout(() => { setInput(''); setIsWrong(false); }, 1000);
    }
  };

  // Build visual model
  const visualGroups = useMemo(() => {
    if (Array.isArray(sequence)) return { mode: 'sequence', items: sequence };
    if (Array.isArray(addends) && addends.length === 2) {
      const iconA = assetId || 'icon_star';
      return { mode: 'two-group', a: Array.from({ length: addends[0] }, () => iconA), b: Array.from({ length: addends[1] }, () => iconA) };
    }
    if (typeof group_a === 'number' && typeof group_b === 'number') {
      return { mode: 'two-group', a: Array.from({ length: group_a }, () => 'icon_block_red'), b: Array.from({ length: group_b }, () => 'icon_block_blue') };
    }
    if (typeof count === 'number' && count > 0) {
      return { mode: 'count', tiles: Array.from({ length: count }, () => assetId || 'icon_block_orange') };
    }
    if (assetId) return { mode: 'single', tiles: [assetId] };
    return { mode: 'none' };
  }, [addends, count, assetId, sequence, group_a, group_b]);

  const getInstructionText = () => {
    if (answered) return '✅ All Correct!';
    if (isWrong) return '❌ Try again!';
    return 'Type your answer below';
  };

  return (
    <View style={styles.container}>
      {/* Visual Context Card */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.visualCard}>
        {visualGroups.mode === 'sequence' ? (
          <View style={styles.visualRow}>{visualGroups.items.map((val, i) => <SequenceCard key={i} value={val} index={i} />)}</View>
        ) : visualGroups.mode === 'two-group' ? (
          <View style={styles.visualRow}>
            <View style={styles.groupBox}>{visualGroups.a.map((id, i) => <VisualTile key={`a-${i}`} assetId={id} index={i} tone="a" />)}</View>
            <Text style={styles.plusText}>+</Text>
            <View style={styles.groupBox}>{visualGroups.b.map((id, i) => <VisualTile key={`b-${i}`} assetId={id} index={i} tone="b" />)}</View>
          </View>
        ) : visualGroups.mode === 'count' ? (
          <View style={styles.countBox}>{visualGroups.tiles.map((id, i) => <VisualTile key={`c-${i}`} assetId={id} index={i} tone="neutral" />)}</View>
        ) : visualGroups.mode === 'single' ? (
          <View style={styles.singleBox}><AssetDisplay assetId={visualGroups.tiles[0]} style={styles.singleAsset} /></View>
        ) : null}
      </Animated.View>


      {/* Answer Area */}
      <View style={styles.answerSection}>
        <View style={[styles.answerBox, isWrong && styles.answerBoxError, answered && styles.answerBoxSuccess]}>
          <Text style={[styles.answerText, answered && { color: Colors.success }]}>{input || (answered ? '' : '?')}</Text>
        </View>
        <Text style={[styles.instructionText, isWrong && { color: Colors.error }, answered && { color: Colors.success }]}>
          {getInstructionText()}
        </Text>
      </View>

      {/* Tactile Numpad */}
      <View style={styles.numpadContainer}>
        <View style={styles.numpadGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
            <NumpadKey
              key={n}
              value={n}
              index={i}
              colorPair={KEY_COLORS[n === 0 ? 9 : n - 1]}
              onPress={handleKeyPress}
              disabled={answered || input.length >= maxDigits}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          <BulkyButton label="Delete" icon="backspace" type="danger" onPress={handleBackspace} disabled={answered || input.length === 0} />
          <BulkyButton label="Check" type="primary" onPress={handleCheckAnswer} disabled={answered || input.length === 0} style={{ flex: 1.5 }} />
        </View>
      </View>
    </View>
  );
};

const TILE_SIZE = SCREEN_WIDTH * 0.11;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  visualCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
    padding: 16,
    minHeight: SCREEN_HEIGHT * 0.16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, maxWidth: SCREEN_WIDTH * 0.35, justifyContent: 'center' },
  countBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  singleBox: { alignItems: 'center' },
  singleAsset: { width: 80, height: 80 },
  visualTile: { width: TILE_SIZE, height: TILE_SIZE, borderRadius: 12, borderWidth: 1.5, padding: 4, justifyContent: 'center', alignItems: 'center' },
  visualTileAsset: { width: '100%', height: '100%' },
  plusText: { fontFamily: 'Lexend-Black', fontSize: 32, color: Colors.onSurfaceVariant },
  
  answerSection: { alignItems: 'center', gap: 8 },
  answerBox: {
    width: 100,
    height: 64,
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerBoxError: { borderColor: Colors.error, backgroundColor: '#fff5f5' },
  answerBoxSuccess: { borderColor: Colors.success, backgroundColor: '#f5fff5' },
  answerText: { fontFamily: 'Lexend-Black', fontSize: 32, color: Colors.onSurface },
  instructionText: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, color: Colors.onSurfaceVariant },

  numpadContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 32,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.outlineVariant,
    gap: 16,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  numKeyWrapper: {
    width: (SCREEN_WIDTH - 100) / 5,
  },
  numKey: {
    height: (SCREEN_WIDTH - 100) / 5,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyText: { fontFamily: 'Lexend-Black', fontSize: 24, color: '#fff' },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  bulkyBtn: { height: 56, borderRadius: 18, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bulkyBtnText: { fontFamily: 'Lexend-Bold', fontSize: 16, letterSpacing: 0.5 },
  disabledBtn: { backgroundColor: Colors.surfaceContainerHighest, borderColor: Colors.outlineVariant },
  cursor: { width: 3, height: 28, backgroundColor: Colors.primary },
  seqCard: {
    width: SCREEN_HEIGHT * 0.075,
    height: SCREEN_HEIGHT * 0.075,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqCardBlank: {
    borderStyle: 'dashed',
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryContainer,
  },
  seqCardText: {
    fontFamily: 'Lexend-Black',
    fontSize: 20,
    color: Colors.onSurface,
  },
});


export default VisualNumpadEngine;

