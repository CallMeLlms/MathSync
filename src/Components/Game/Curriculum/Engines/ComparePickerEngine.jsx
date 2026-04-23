import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── PileDisplay — renders emoji repeated N times in a wrap grid ───
const PileDisplay = ({ emoji, count }) => {
  const items = Array.from({ length: Math.min(count, 10) });
  return (
    <View style={styles.pileGrid}>
      {items.map((_, i) => (
        <Text key={i} style={styles.pileEmoji}>{emoji}</Text>
      ))}
    </View>
  );
};

// ─── TileCard — bulky tactile selection tile ───
const TileCard = ({ pileKey, count, emoji, isSelected, evaluation, disabled, onPress, index }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const state = evaluation || (isSelected ? 'selected' : 'idle');

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

  const colors = {
    idle:     { border: Colors.outlineVariant,      bg: Colors.surfaceContainerLowest,  text: Colors.onSurface },
    selected: { border: Colors.secondary,            bg: Colors.secondaryContainer,      text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,              bg: '#e8f5e9',                      text: Colors.success },
    wrong:    { border: Colors.error,                bg: '#ffebee',                      text: Colors.error },
  }[state];

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 120)}
      style={styles.tileWrapper}
    >
      <Pressable
        onPress={() => !disabled && onPress(pileKey)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.tileCard,
            animatedStyle,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          {/* Badge */}
          {state === 'correct' && (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            </View>
          )}
          {state === 'wrong' && (
            <View style={styles.badge}>
              <Ionicons name="close-circle" size={28} color={Colors.error} />
            </View>
          )}

          {/* Emoji pile */}
          <PileDisplay emoji={emoji} count={count} />

          {/* Count label */}
          <Text style={[styles.countLabel, { color: colors.text }]}>{count}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CheckButton ───
const CheckButton = ({ onPress, disabled, label = 'CHECK' }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    bottomWidth.value = withSpring(6);
  };

  return (
    <View style={styles.checkButtonContainer}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[
            styles.checkButton,
            animatedStyle,
            disabled && styles.checkButtonDisabled,
          ]}
        >
          <Text style={[styles.checkButtonText, disabled && styles.checkButtonTextDisabled]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── ComparePickerEngine ───
const ComparePickerEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const pileA = metadata.pile_a ?? 0;
  const pileB = metadata.pile_b ?? 0;
  
  // Support distinct emojis for each pile, fallback to generic emoji if missing
  const emojiA = metadata.emoji_a ?? metadata.emoji ?? '🍎';
  const emojiB = metadata.emoji_b ?? metadata.emoji ?? '🍎';

  const [selectedTile, setSelectedTile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setSelectedTile(null);
    setEvaluation(null);
    setResolved(false);
  }, [data]);

  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => { clearTimeout(timer); speechManager.stop(); };
    }
  }, [questionText]);

  const handleCheck = () => {
    if (!selectedTile || resolved) return;

    const isCorrect = selectedTile === answer;

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [selectedTile]), 800);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [selectedTile]), 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Two comparison tiles — full-width vertical stack */}
      <View style={styles.tilesColumn}>
          <TileCard
            pileKey="pile_a"
            count={pileA}
            emoji={emojiA}
            isSelected={selectedTile === 'pile_a'}
            evaluation={selectedTile === 'pile_a' ? evaluation : null}
            disabled={resolved}
            onPress={setSelectedTile}
            index={0}
          />
          <TileCard
            pileKey="pile_b"
            count={pileB}
            emoji={emojiB}
            isSelected={selectedTile === 'pile_b'}
            evaluation={selectedTile === 'pile_b' ? evaluation : null}
            disabled={resolved}
            onPress={setSelectedTile}
            index={1}
          />
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedTile || resolved || !!evaluation}
        label={resolved ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  tilesColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  tileWrapper: {
    flex: 1,
  },
  tileCard: {
    minHeight: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  pileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  pileEmoji: {
    fontSize: 28,
  },
  countLabel: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
  },
  checkButtonContainer: {
    width: '100%',
  },
  checkButton: {
    width: '100%',
    backgroundColor: Colors.tertiary,
    borderColor: '#004d1e',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1.2,
  },
  checkButtonTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
});

export default ComparePickerEngine;
