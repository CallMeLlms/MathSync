import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── OptionButton ───
const OptionButton = ({ label, index, isSelected, evaluation, disabled, onPress }) => {
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
    idle: { border: Colors.outlineVariant, bg: Colors.surfaceContainerLowest, text: Colors.onSurface },
    selected: { border: Colors.secondary, bg: Colors.secondaryContainer, text: Colors.onSecondaryContainer },
    correct: { border: Colors.success, bg: '#e8f5e9', text: Colors.success },
    wrong: { border: Colors.error, bg: '#ffebee', text: Colors.error },
  }[state];

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 80)}
      style={styles.optionWrapper}
    >
      <Pressable
        onPress={() => !disabled && onPress(label)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.optionButton,
            animatedStyle,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>{String(label)}</Text>
          {state === 'correct' && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={styles.badge} />
          )}
          {state === 'wrong' && (
            <Ionicons name="close-circle" size={24} color={Colors.error} style={styles.badge} />
          )}
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

// ─── VisualPickerEngine ───
const VisualPickerEngine = ({ data, onResult }) => {
  const { question: questionText, answer, assetId, metadata = {} } = data;
  const options = metadata.options || [];
  const addends = metadata.addends;

  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [resolved, setResolved] = useState(false);

  const shuffledOptions = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    [data]
  );

  useEffect(() => {
    setSelectedOption(null);
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
    if (!selectedOption || resolved) return;

    const normalizedSelected = String(selectedOption).toLowerCase().trim();
    const normalizedAnswer = String(answer).toLowerCase().trim();
    const isCorrect = normalizedSelected === normalizedAnswer;

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selectedOption)]), 800);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [String(selectedOption)]), 1000);
    }
  };

  const equationLabel = useMemo(() => {
    if (!Array.isArray(addends) || addends.length < 2) return null;
    return `${addends[0]} + ${addends[1]} = ?`;
  }, [addends]);

  const wordTokens = useMemo(() => {
    if (!Array.isArray(addends) || addends.length < 2) return null;
    return [String(addends[0]), '+', String(addends[1])];
  }, [addends]);

  return (
    <View style={styles.container}>
      {/* Scrollable content */}
      <View style={styles.content}>
        {/* Story Header */}
        <Animated.View entering={FadeInDown.springify().delay(80)} style={styles.storyHeader}>
          {assetId && (
            <View style={styles.assetCard}>
              <AssetDisplay assetId={assetId} style={styles.assetImage} resizeMode="contain" />
            </View>
          )}
          <View style={[styles.speechBubble, !assetId && styles.speechBubbleFull]}>
            {assetId && <View style={styles.bubbleTail} />}
            <Text style={styles.speechText}>{questionText}</Text>
          </View>
        </Animated.View>

        {/* Equation indicator */}
        {equationLabel && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.equationPill}>
            <Text style={styles.equationText}>{equationLabel}</Text>
          </Animated.View>
        )}

        {/* Options */}
        <View style={styles.optionsList}>
          {shuffledOptions.map((opt, idx) => (
            <OptionButton
              key={`${idx}-${opt}`}
              label={opt}
              index={idx}
              isSelected={selectedOption === opt}
              evaluation={selectedOption === opt ? evaluation : null}
              disabled={resolved}
              onPress={setSelectedOption}
            />
          ))}
        </View>
      </View>

      {/* Check button — pinned to bottom */}
      <CheckButton
        onPress={handleCheck}
        disabled={!selectedOption || resolved || !!evaluation}
        label={resolved ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const CARD_SIZE = SCREEN_WIDTH * 0.22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  content: {
    gap: 16,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  assetCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    flexShrink: 0,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  assetImage: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    padding: 14,
    position: 'relative',
  },
  speechBubbleFull: {
    borderTopLeftRadius: 20,
  },
  bubbleTail: {
    position: 'absolute',
    left: -13,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 13,
    borderTopColor: Colors.outlineVariant,
    borderLeftWidth: 13,
    borderLeftColor: 'transparent',
  },
  speechText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  equationPill: {
    alignSelf: 'center',
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.secondary,
  },
  equationText: {
    fontFamily: 'Lexend-Black',
    fontSize: 22,
    color: Colors.onSecondaryContainer,
    letterSpacing: 1,
  },
  tokenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tokenChip: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  tokenChipOperator: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  tokenText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  tokenTextOperator: {
    color: Colors.onPrimaryContainer,
  },
  optionsList: {
    gap: 12,
  },
  optionWrapper: {
    width: '100%',
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  optionText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    right: 16,
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

export default VisualPickerEngine;
